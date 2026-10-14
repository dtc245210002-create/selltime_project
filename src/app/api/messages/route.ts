import { authenticate, authFailure, authResponse } from "@/infrastructure/auth/server";
import { AuthError, boundedString, readBody, requireOwner } from "@/infrastructure/auth/policy";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

async function requireConversation(client: SupabaseClient, userId: string, conversationId: string) {
  const { data, error } = await client.from("conversations").select("id,candidate_id,employer_id").eq("id", conversationId).maybeSingle();
  if (error) throw new AuthError(503, "Không thể xác minh hội thoại.");
  if (!data || (data.candidate_id !== userId && data.employer_id !== userId)) throw new AuthError(404, "Không tìm thấy hội thoại.");
}

export async function GET(req: Request) {
  try {
    const { client, identity } = await authenticate(req);
    const conversationId = boundedString(new URL(req.url).searchParams.get("conversation_id"), 50, "Hội thoại");
    await requireConversation(client, identity.userId, conversationId);
    const { data, error } = await client.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: false }).limit(150);
    if (error) throw new AuthError(503, "Không thể tải tin nhắn.");
    return authResponse({ success: true, conversation_id: conversationId, data: (data ?? []).reverse() });
  } catch (error) { return authFailure(error); }
}

export async function POST(req: Request) {
  try {
    const { client, identity } = await authenticate(req, true);
    const body = await readBody(req);
    const conversationId = boundedString(body.conversation_id, 50, "Hội thoại");
    await requireConversation(client, identity.userId, conversationId);
    requireOwner(identity, body.sender_id);
    const content = boundedString(body.content, 2000, "Nội dung");
    const { data, error } = await client.from("messages").insert({
      id: crypto.randomUUID(), conversation_id: conversationId, sender_id: identity.userId,
      sender_name: identity.fullName, sender_avatar: identity.avatarUrl ?? "", content,
      created_at: new Date().toISOString(),
    }).select().single();
    if (error) throw new AuthError(error.code === "42501" ? 403 : 503, "Không thể gửi tin nhắn.");
    return authResponse({ success: true, data }, 201);
  } catch (error) { return authFailure(error); }
}

// Không có reset chat thật; chỉ xóa một tin nhắn của chính thành viên gửi.
export async function DELETE(req: Request) {
  try {
    const { client, identity } = await authenticate(req, true);
    const url = new URL(req.url);
    const conversationId = boundedString(url.searchParams.get("conversation_id"), 50, "Hội thoại");
    await requireConversation(client, identity.userId, conversationId);
    const messageId = boundedString(url.searchParams.get("message_id"), 50, "Tin nhắn");
    const { data, error } = await client.from("messages").delete().eq("id", messageId).eq("conversation_id", conversationId).eq("sender_id", identity.userId).select("id");
    if (error) throw new AuthError(503, "Không thể xóa tin nhắn.");
    if (!data?.length) throw new AuthError(404, "Không tìm thấy tin nhắn.");
    return authResponse({ success: true });
  } catch (error) { return authFailure(error); }
}
