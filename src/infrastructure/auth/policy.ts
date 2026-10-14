import type { UserRole, VerifiedIdentity } from "../../domain/types";

export class AuthError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function requireRole(identity: VerifiedIdentity, role: UserRole) {
  if (identity.role !== role) throw new AuthError(403, "Không có quyền thực hiện thao tác.");
}

export function requireOwner(identity: VerifiedIdentity, claimed: unknown) {
  if (claimed !== undefined && claimed !== identity.userId) {
    throw new AuthError(403, "Không được sử dụng danh tính người khác.");
  }
}

export function requireOrigin(req: Request, allowedOrigin: string) {
  if (req.headers.get("origin") !== allowedOrigin) {
    throw new AuthError(403, "Origin không được phép.");
  }
}

export function boundedString(value: unknown, max: number, name: string): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) {
    throw new AuthError(400, `${name} không hợp lệ.`);
  }
  return value.trim();
}

export async function readBody(req: Request): Promise<Record<string, unknown>> {
  const limit = 32768;
  if (Number(req.headers.get("content-length")) > limit) {
    void req.body?.cancel().catch(() => {});
    throw new AuthError(413, "Dữ liệu quá lớn.");
  }
  const chunks: Uint8Array[] = [];
  let size = 0;
  const reader = req.body?.getReader();
  if (reader) {
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > limit) {
          // Không đợi nguồn stream hủy xong mới trả lỗi; không buffer phần vượt giới hạn.
          void reader.cancel().catch(() => {});
          throw new AuthError(413, "Dữ liệu quá lớn.");
        }
        if (value.byteLength) chunks.push(value.slice());
      }
    } finally { reader.releaseLock(); }
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const text = new TextDecoder().decode(bytes);
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw new AuthError(400, "JSON không hợp lệ."); }
}
