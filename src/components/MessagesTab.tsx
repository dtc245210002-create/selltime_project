"use client";

import React, { useState } from "react";
import { Send, CheckCheck, Clock, ShieldCheck } from "lucide-react";

export function MessagesTab() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Lan (The Cuppa Coffee)",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
      content: "Chào Huy! Chị thấy em vừa ứng tuyển ca tối 18:00 - 22:00. Em có thể đến sớm 10 phút để nhận áo đồng phục không em?",
      time: "17:15",
      isMe: false,
    },
    {
      id: 2,
      sender: "Nguyễn Đức Huy",
      content: "Dạ được ạ chị Lan! Em học xong tiết lúc 17h30 ở TNUT, em chạy xe qua quán mất khoảng 5 phút thôi ạ.",
      time: "17:18",
      isMe: true,
    },
    {
      id: 3,
      sender: "Lan (The Cuppa Coffee)",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
      content: "Oke em nhé! Chị đã nạp ký quỹ Escrow PayOS vào hệ thống rồi, xong ca bấm checkout là tài khoản em nhận đủ 153.000đ (kèm thưởng SOS) nha!",
      time: "17:20",
      isMe: false,
    },
  ]);

  const [inputVal, setInputVal] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "Nguyễn Đức Huy",
        content: inputVal,
        time: "Vừa xong",
        isMe: true,
      },
    ]);
    setInputVal("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Top Bar for Chat */}
      <div className="bg-white p-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
            alt="Lan"
            className="w-9 h-9 rounded-full object-cover border border-indigo-200"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-800">Chị Lan (The Cuppa)</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-[10px] text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Đang hoạt động • Ký quỹ Escrow đã nạp
            </span>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        <div className="text-center my-2">
          <span className="text-[10px] bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-full">
            Hôm nay, 12/09/2026
          </span>
        </div>

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.isMe ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${
                m.isMe
                  ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                  : "bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm"
              }`}
            >
              <p className="leading-relaxed">{m.content}</p>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1 px-1">
              <span>{m.time}</span>
              {m.isMe && <CheckCheck className="w-3 h-3 text-indigo-500" />}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Nhắn tin với chủ quán..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 bg-slate-100 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
        />
        <button
          type="submit"
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
