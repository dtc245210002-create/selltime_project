"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  CheckCheck,
  Clock,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Check,
  MessageSquare,
} from "lucide-react";
import { User, UserRole } from "../domain/types";
import { MOCK_CANDIDATE_USER, MOCK_EMPLOYER_USER } from "../application/store";

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  content: string;
  created_at: string;
}

interface MessagesTabProps {
  currentUser?: User | null;
  currentRole?: UserRole;
}

export function MessagesTab({
  currentUser = MOCK_CANDIDATE_USER,
  currentRole = "CANDIDATE",
}: MessagesTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Xác định đối phương trò chuyện dựa trên vai trò hiện tại
  const isEmployer = currentRole === "EMPLOYER";
  const partner = isEmployer ? MOCK_CANDIDATE_USER : MOCK_EMPLOYER_USER;
  const myUser = currentUser || (isEmployer ? MOCK_EMPLOYER_USER : MOCK_CANDIDATE_USER);

  // Câu trả lời nhanh theo vai trò
  const quickReplies = isEmployer
    ? [
        "Chào em, em qua quán trước 10 phút nhận đồng phục nhé!",
        "Em đến quán cứ vào quầy thu ngân gặp chị nha.",
        "Chị đã ký quỹ Escrow rồi, xong ca nhận tiền ngay nhé!",
      ]
    : [
        "Dạ em chào chị, em đã đến trước cửa quán rồi ạ!",
        "Em vừa học xong ở TNUT, em chạy qua quán 5 phút nữa tới ạ.",
        "Chị ơi mã PIN check-in tại quầy hôm nay là 8866 đúng không ạ?",
      ];

  // Hàm tải tin nhắn từ API
  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setMessages(data.data);
      }
    } catch (err) {
      console.warn("Không thể tải tin nhắn:", err);
    }
  };

  // Nạp tin nhắn lần đầu và thiết lập Polling thời gian thực mỗi 2 giây
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Xử lý gửi tin nhắn
  const handleSend = async (contentToSend?: string) => {
    const text = contentToSend || inputVal;
    if (!text.trim() || isSending) return;

    setIsSending(true);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    // Optimistic UI update
    const tempMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      sender_id: myUser.id,
      sender_name: myUser.full_name,
      sender_avatar: myUser.avatar_url || "",
      content: text.trim(),
      created_at: timeStr,
    };

    setMessages((prev) => [...prev, tempMsg]);
    setInputVal("");

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: myUser.id,
          sender_name: myUser.full_name,
          sender_avatar: myUser.avatar_url,
          content: text.trim(),
        }),
      });
      fetchMessages();
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Top Header: Đối phương trò chuyện */}
      <div className="bg-white p-3 border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={partner.avatar_url}
              alt={partner.full_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-extrabold text-slate-900">
                {isEmployer ? partner.full_name : "Chị Lan (The Cuppa Coffee)"}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
              <span>Đang trực tuyến</span> •{" "}
              <span>{isEmployer ? "SV TNUT (100% Uy tín)" : "Đã nạp Escrow bảo đảm"}</span>
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            {isEmployer ? "Chế độ: Chủ cơ sở" : "Chế độ: Sinh viên"}
          </span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        <div className="text-center my-2">
          <span className="text-[10px] bg-slate-200/80 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
            Kênh trò chuyện ca làm việc • Mã hóa nội bộ
          </span>
        </div>

        {messages.map((m) => {
          const isMe = m.sender_id === myUser.id;

          return (
            <div
              key={m.id}
              className={`flex items-end gap-2 ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              {!isMe && (
                <img
                  src={m.sender_avatar || partner.avatar_url}
                  alt={m.sender_name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 mb-3"
                />
              )}

              <div
                className={`flex flex-col ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                    isMe
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none"
                      : "bg-white text-slate-800 rounded-bl-none border border-slate-200/80"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>

                <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1 px-1">
                  <span>{m.created_at}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-indigo-500" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Suggestions */}
      <div className="px-3 py-1.5 bg-slate-100/90 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          Gợi ý nhanh:
        </span>
        {quickReplies.map((reply, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(reply)}
            className="text-[11px] font-medium bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-2.5 py-1 rounded-full border border-slate-200 shrink-0 transition-colors shadow-2xs active:scale-95"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder={
            isEmployer
              ? "Nhắn tin cho ứng viên Huy (dặn dò trước ca)..."
              : "Nhắn tin với chủ quán Chị Lan..."
          }
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 bg-slate-100 border border-slate-200 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || isSending}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
