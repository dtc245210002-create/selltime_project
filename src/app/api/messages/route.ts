import { NextResponse } from "next/server";

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  content: string;
  created_at: string;
}

// In-memory message store dùng chung cho tất cả các thiết bị kết nối
let sharedMessages: ChatMessage[] = [
  {
    id: "msg_1",
    sender_id: "user_emp_lan_02",
    sender_name: "Chị Lan (The Cuppa)",
    sender_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    content: "Chào Huy! Chị thấy em vừa ứng tuyển ca tối 18:00 - 22:00. Em có thể đến sớm 10 phút để nhận áo đồng phục không em?",
    created_at: "17:15",
  },
  {
    id: "msg_2",
    sender_id: "user_cand_huy_01",
    sender_name: "Nguyễn Đức Huy",
    sender_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    content: "Dạ được ạ chị Lan! Em học xong tiết lúc 17h30 ở TNUT, em chạy xe qua quán mất khoảng 5 phút thôi ạ.",
    created_at: "17:18",
  },
  {
    id: "msg_3",
    sender_id: "user_emp_lan_02",
    sender_name: "Chị Lan (The Cuppa)",
    sender_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    content: "Oke em nhé! Chị đã nạp ký quỹ Escrow PayOS vào hệ thống rồi, xong ca bấm checkout là tài khoản em nhận đủ 153.000đ nha!",
    created_at: "17:20",
  },
];

export async function GET() {
  return NextResponse.json({ success: true, data: sharedMessages });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sender_id, sender_name, sender_avatar, content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: "Nội dung không được để trống" }, { status: 400 });
    }

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender_id: sender_id || "user_cand_huy_01",
      sender_name: sender_name || "Thành viên",
      sender_avatar: sender_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      content: content.trim(),
      created_at: timeStr,
    };

    sharedMessages.push(newMsg);

    // Giữ tối đa 100 tin nhắn gần nhất trong bộ nhớ
    if (sharedMessages.length > 100) {
      sharedMessages = sharedMessages.slice(-100);
    }

    return NextResponse.json({ success: true, data: newMsg, allMessages: sharedMessages });
  } catch (err) {
    console.error("Lỗi gửi tin nhắn:", err);
    return NextResponse.json({ success: false, error: "Lỗi xử lý tin nhắn" }, { status: 500 });
  }
}
