import { createClient, type SupabaseClient, type Session } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { VerifiedIdentity } from "../../domain/types";
import { AuthError, requireOrigin } from "./policy";

export const ACCESS_COOKIE = "selltime-auth-access";
export const REFRESH_COOKIE = "selltime-auth-refresh";

// Cấu hình riêng, tuyệt đối không đọc credential của kết nối DEMO cũ.
export function authConfig() {
  const url = process.env.SELLTIME_AUTH_SUPABASE_URL;
  const key = process.env.SELLTIME_AUTH_SUPABASE_ANON_KEY;
  const origin = process.env.SELLTIME_AUTH_ORIGIN;
  if (process.env.SELLTIME_AUTH_ENABLED !== "true" || !url || !key || !origin) {
    throw new AuthError(503, "Khu vực tài khoản chưa được cấu hình.");
  }
  try {
    const provider = new URL(url);
    const app = new URL(origin);
    if (provider.protocol !== "https:" || app.origin !== origin ||
      (app.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && app.hostname === "localhost"))) throw new Error();
  } catch { throw new AuthError(503, "Cấu hình tài khoản không hợp lệ."); }
  return { url, key, origin };
}

export function createRequestClient(token?: string): SupabaseClient {
  const { url, key } = authConfig();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {}, fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}

export function cookieValue(req: Request, name: string): string | undefined {
  const part = req.headers.get("cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith(`${name}=`));
  if (!part) return undefined;
  try { return decodeURIComponent(part.slice(name.length + 1)); } catch { throw new AuthError(401, "Session không hợp lệ."); }
}

export async function verifyToken(client: SupabaseClient, token: string): Promise<VerifiedIdentity> {
  const { data: auth, error: authError } = await client.auth.getUser(token);
  if (authError || !auth.user) throw new AuthError(401, "Session không hợp lệ hoặc đã hết hạn.");
  const { data: profile, error } = await client.from("users")
    .select("id,auth_user_id,role,full_name,avatar_url,email").eq("auth_user_id", auth.user.id).single();
  if (error) throw new AuthError(503, "Không thể xác minh hồ sơ tài khoản.");
  if (!profile || profile.auth_user_id !== auth.user.id || !["CANDIDATE", "EMPLOYER", "ADMIN"].includes(profile.role)) {
    throw new AuthError(403, "Tài khoản chưa có hồ sơ hợp lệ.");
  }
  return { authUserId: auth.user.id, userId: profile.id, role: profile.role, fullName: profile.full_name, avatarUrl: profile.avatar_url, email: profile.email };
}

export async function authenticate(req: Request, mutation = false) {
  const config = authConfig();
  if (mutation) requireOrigin(req, config.origin);
  const authorization = req.headers.get("authorization");
  const token = authorization ? /^Bearer ([^\s]+)$/.exec(authorization)?.[1] : cookieValue(req, ACCESS_COOKIE);
  if (!token || token.length > 16000) throw new AuthError(401, "Cần đăng nhập tài khoản thật.");
  const client = createRequestClient(token);
  const identity = await verifyToken(client, token);
  return { client, identity, token };
}

export function authResponse(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store", "Vary": "Cookie, Authorization", "CDN-Cache-Control": "no-store" } });
}

export function authFailure(error: unknown) {
  return authResponse({ success: false, error: error instanceof AuthError ? error.message : "Không thể xử lý yêu cầu." }, error instanceof AuthError ? error.status : 503);
}

export function sessionCookies(response: NextResponse, session: Session | null) {
  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/" };
  response.cookies.set(ACCESS_COOKIE, session?.access_token ?? "", { ...options, maxAge: session ? session.expires_in : 0 });
  response.cookies.set(REFRESH_COOKIE, session?.refresh_token ?? "", { ...options, maxAge: session ? 60 * 60 * 24 * 7 : 0 });
  return response;
}
