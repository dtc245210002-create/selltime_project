import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  content: string;
  created_at: string;
}

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  conv_1: [
    {
      id: "msg_1",
      conversation_id: "conv_1",
      sender_id: "user_emp_lan_02",
      sender_name: "Chị Lan (The Cuppa)",
      sender_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
      content: "Chào Huy! Chị thấy em vừa ứng tuyển ca tối 18:00 - 22:00. Em có thể đến sớm 10 phút để nhận áo đồng phục không em?",
      created_at: "17:15",
    },
    {
      id: "msg_2",
      conversation_id: "conv_1",
      sender_id: "user_cand_huy_01",
      sender_name: "Nguyễn Đức Huy",
      sender_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      content: "Dạ được ạ chị Lan! Em học xong tiết lúc 17h30 ở TNUT, em chạy xe qua quán mất khoảng 5 phút thôi ạ.",
      created_at: "17:18",
    },
    {
      id: "msg_3",
      conversation_id: "conv_1",
      sender_id: "user_emp_lan_02",
      sender_name: "Chị Lan (The Cuppa)",
      sender_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
      content: "Oke em nhé! Chị đã nạp ký quỹ Escrow PayOS vào hệ thống rồi, xong ca bấm checkout là tài khoản em nhận đủ 153.000đ nha!",
      created_at: "17:20",
    },
  ],
  conv_2: [
    {
      id: "msg_2_1",
      conversation_id: "conv_2",
      sender_id: "user_emp_minh_03",
      sender_name: "Anh Minh (Circle K)",
      sender_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      content: "Ca chiều 12h30 em có thể đến nhận ca Circle K đối diện ĐH Sư Phạm được không?",
      created_at: "Hôm qua",
    },
    {
      id: "msg_2_2",
      conversation_id: "conv_2",
      sender_id: "user_cand_maianh",
      sender_name: "Trần Mai Anh (Sư Phạm)",
      sender_avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      content: "Dạ được ạ anh Minh, em sẽ qua đúng giờ!",
      created_at: "Hôm qua",
    },
  ],
  conv_3: [
    {
      id: "msg_3_1",
      conversation_id: "conv_3",
      sender_id: "user_emp_dingtea_04",
      sender_name: "Ding Tea Thái Nguyên",
      sender_avatar: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=100&auto=format&fit=crop&q=80",
      content: "Đã xác nhận ca làm việc tối nay 17h30. Chúc em hoàn thành ca thật tốt!",
      created_at: "10/09",
    },
  ],
};

// Global in-memory cache
const globalMessageStore: Record<string, ChatMessage[]> = {
  conv_1: [...INITIAL_MESSAGES.conv_1],
  conv_2: [...INITIAL_MESSAGES.conv_2],
  conv_3: [...INITIAL_MESSAGES.conv_3],
};

const getTopic = (convId: string) => `selltime_v1_chat_${convId.replace(/[^a-zA-Z0-9_]/g, "")}`;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const convId = url.searchParams.get("conversation_id") || "conv_1";

    if (!globalMessageStore[convId]) {
      globalMessageStore[convId] = INITIAL_MESSAGES[convId]
        ? [...INITIAL_MESSAGES[convId]]
        : [];
    }

    // Đồng bộ từ Cloud Hub (ntfy.sh cache)
    try {
      const topic = getTopic(convId);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const cloudRes = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=all`, {
        signal: controller.signal,
        headers: { "Cache-Control": "no-cache" },
      });
      clearTimeout(timeoutId);

      if (cloudRes.ok) {
        const text = await cloudRes.text();
        const lines = text.trim().split("\n");
        for (const line of lines) {
          if (!line) continue;
          try {
            const entry = JSON.parse(line);
            if (entry.event === "message" && entry.message) {
              const msg: ChatMessage = JSON.parse(entry.message);
              if (msg && msg.id && msg.content) {
                if (!globalMessageStore[convId].some((m) => m.id === msg.id)) {
                  globalMessageStore[convId].push(msg);
                }
              }
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      // Graceful fallback to memory store
    }

    return NextResponse.json(
      { success: true, conversation_id: convId, data: globalMessageStore[convId] },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("GET /api/messages error:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi tải tin nhắn" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      conversation_id = "conv_1",
      sender_id,
      sender_name,
      sender_avatar,
      content,
    } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Nội dung không được để trống" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const newMsg: ChatMessage = {
      id: body.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      conversation_id,
      sender_id: sender_id || "user_cand_huy_01",
      sender_name: sender_name || "Thành viên",
      sender_avatar:
        sender_avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      content: content.trim(),
      created_at: body.created_at || timeStr,
    };

    if (!globalMessageStore[conversation_id]) {
      globalMessageStore[conversation_id] = INITIAL_MESSAGES[conversation_id]
        ? [...INITIAL_MESSAGES[conversation_id]]
        : [];
    }

    // Lưu vào in-memory store
    if (!globalMessageStore[conversation_id].some((m) => m.id === newMsg.id)) {
      globalMessageStore[conversation_id].push(newMsg);
    }

    // Giữ tối đa 150 tin nhắn
    if (globalMessageStore[conversation_id].length > 150) {
      globalMessageStore[conversation_id] = globalMessageStore[conversation_id].slice(-150);
    }

    // Phát sóng ra Cloud Hub (ntfy.sh) đồng bộ tức thì cho tất cả thiết bị
    const topic = getTopic(conversation_id);
    fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: {
        "X-Cache": "yes",
        "Title": `SellTime: ${newMsg.sender_name}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMsg),
    }).catch((e) => console.warn("Lỗi push cloud ntfy:", e));

    return NextResponse.json(
      {
        success: true,
        data: newMsg,
        allMessages: globalMessageStore[conversation_id],
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("POST /api/messages error:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi xử lý tin nhắn" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const convId = url.searchParams.get("conversation_id") || "conv_1";

    globalMessageStore[convId] = INITIAL_MESSAGES[convId]
      ? [...INITIAL_MESSAGES[convId]]
      : [];

    return NextResponse.json(
      { success: true, message: "Đã làm mới cuộc hội thoại", data: globalMessageStore[convId] },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Lỗi reset hội thoại" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
