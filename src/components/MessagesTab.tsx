"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  CheckCheck,
  Clock,
  ShieldCheck,
  Sparkles,
  Search,
  MapPin,
  QrCode,
  AlertTriangle,
  ChevronRight,
  Info,
  Calendar,
  Wallet,
  Users,
  MessageSquare,
} from "lucide-react";
import { Shift, User, UserRole } from "../domain/types";
import { MOCK_CANDIDATE_USER, MOCK_EMPLOYER_USER, INITIAL_SHIFTS } from "../application/store";
import { ApplicationStepper, ApplicationStep } from "./ApplicationStepper";

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  content: string;
  created_at: string;
}

interface ConversationItem {
  id: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  shift: Shift;
  step: ApplicationStep;
}

interface MessagesTabProps {
  currentUser?: User | null;
  currentRole?: UserRole;
  onOpenCheckin?: (shift: Shift) => void;
}

export function MessagesTab({
  currentUser = MOCK_CANDIDATE_USER,
  currentRole = "CANDIDATE",
  onOpenCheckin,
}: MessagesTabProps) {
  const isEmployer = currentRole === "EMPLOYER";
  const myUser = currentUser || (isEmployer ? MOCK_EMPLOYER_USER : MOCK_CANDIDATE_USER);

  // Danh sách các cuộc trò chuyện mẫu
  const conversations: ConversationItem[] = [
    {
      id: "conv_1",
      partnerName: isEmployer ? "Nguyễn Đức Huy (TNUT)" : "Chị Lan (The Cuppa Coffee)",
      partnerAvatar: isEmployer
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
      lastMessage: "Chị đã nạp ký quỹ Escrow PayOS rồi nhé!",
      time: "17:20",
      unreadCount: 1,
      shift: INITIAL_SHIFTS[0], // Ca SOS The Cuppa
      step: "INTERVIEWING",
    },
    {
      id: "conv_2",
      partnerName: isEmployer ? "Trần Mai Anh (Sư Phạm)" : "Anh Minh (Circle K Sinh Viên)",
      partnerAvatar: isEmployer
        ? "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      lastMessage: "Ca chiều 12h30 em có thể đến nhận ca được không?",
      time: "Hôm qua",
      shift: INITIAL_SHIFTS[2], // Circle K
      step: "REVIEWING",
    },
    {
      id: "conv_3",
      partnerName: isEmployer ? "Lê Hoàng Nam (Nông Lâm)" : "Quán Ding Tea Thái Nguyên",
      partnerAvatar: isEmployer
        ? "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=100&auto=format&fit=crop&q=80",
      lastMessage: "Đã xác nhận ca làm việc tối nay 17h30",
      time: "10/09",
      shift: INITIAL_SHIFTS[1], // Ding Tea
      step: "ACCEPTED",
    },
  ];

  const [activeConvId, setActiveConvId] = useState<string>("conv_1");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat" | "details">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  // Quick replies
  const quickReplies = isEmployer
    ? [
        "Chào em, em qua quán trước 10 phút nhận đồng phục nhé!",
        "Em đến quán cứ vào quầy thu ngân gặp chị nha.",
        "Chị đã nạp ký quỹ Escrow rồi, xong ca nhận tiền ngay nhé!",
      ]
    : [
        "Dạ em chào chị, em đã đến trước cửa quán rồi ạ!",
        "Em vừa học xong ở TNUT, em chạy qua quán 5 phút nữa tới ạ.",
        "Chị ơi mã PIN check-in tại quầy hôm nay là 8866 đúng không ạ?",
      ];

  // Nạp tin nhắn từ API
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

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (contentToSend?: string) => {
    const text = contentToSend || inputVal;
    if (!text.trim() || isSending) return;

    setIsSending(true);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

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

  const filteredConversations = conversations.filter((c) =>
    c.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-[650px] lg:h-[720px] bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row overflow-hidden">
      {/* ========================================================================= */}
      {/* CỘT 1 (BÊN TRÁI): DANH SÁCH CÁC CUỘC TRÒ CHUYỆN (CONVERSATIONS LIST)     */}
      {/* ========================================================================= */}
      <div
        className={`w-full lg:w-[290px] shrink-0 border-r border-slate-200 flex flex-col bg-slate-50/50 ${
          mobileView !== "list" ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Search header */}
        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
              Cuộc trò chuyện
            </h3>
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
              {conversations.length} hội thoại
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên người nhắn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* List of chats */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === activeConvId;

            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => {
                  setActiveConvId(conv.id);
                  setMobileView("chat");
                }}
                className={`w-full p-3 flex items-start gap-2.5 text-left transition-colors ${
                  isSelected
                    ? "bg-indigo-50/70 border-l-4 border-indigo-600"
                    : "hover:bg-white"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={conv.partnerAvatar}
                    alt={conv.partnerName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  {conv.unreadCount && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {conv.partnerName}
                    </span>
                    <span className="text-[10px] text-slate-400">{conv.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {conv.lastMessage}
                  </p>
                  <span className="inline-block text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded mt-1 truncate">
                    {conv.shift.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CỘT 2 (Ở GIỮA): NỘI DUNG HỘI THOẠI CHÍNH (MAIN CHAT AREA)                 */}
      {/* ========================================================================= */}
      <div
        className={`flex-1 flex flex-col bg-slate-50 min-w-0 ${
          mobileView !== "chat" ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Chat Header */}
        <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Nút quay lại danh sách trên mobile */}
            <button
              onClick={() => setMobileView("list")}
              className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              ←
            </button>

            <div className="relative">
              <img
                src={activeConv.partnerAvatar}
                alt={activeConv.partnerName}
                className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-900">
                  {activeConv.partnerName}
                </h4>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                <span>Đang trực tuyến</span> •{" "}
                <span>
                  {isEmployer
                    ? "SV ĐH Kỹ thuật Công nghiệp (TNUT)"
                    : "The Cuppa Coffee (Đã Ký quỹ Escrow)"}
                </span>
              </p>
            </div>
          </div>

          {/* Nút xem chi tiết ca làm trên mobile */}
          <button
            onClick={() => setMobileView("details")}
            className="lg:hidden text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Xem ca</span>
          </button>
        </div>

        {/* Chat messages feed */}
        <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
          <div className="text-center my-1">
            <span className="text-[10px] bg-slate-200/80 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
              Kênh trao đổi chính thức ca {activeConv.shift.shift_start} - {activeConv.shift.shift_end}
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
                    src={m.sender_avatar || activeConv.partnerAvatar}
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
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs leading-relaxed ${
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

        {/* Gợi ý nhanh (Quick replies) */}
        <div className="px-3 py-1.5 bg-slate-100/90 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Gợi ý:
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
                ? "Nhắn tin cho ứng viên Huy (dặn dò nhận ca)..."
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

      {/* ========================================================================= */}
      {/* CỘT 3 (BÊN PHẢI): THÔNG TIN CA LÀM & TIẾN TRÌNH 5 BƯỚC (JOB INFO & STEPPER) */}
      {/* ========================================================================= */}
      <div
        className={`w-full lg:w-[310px] shrink-0 border-l border-slate-200 flex flex-col bg-white overflow-y-auto p-4 space-y-4 ${
          mobileView !== "details" ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Nút đóng panel trên mobile */}
        <div className="flex lg:hidden items-center justify-between pb-2 border-b border-slate-100">
          <span className="font-bold text-xs text-slate-800">Chi tiết ca làm</span>
          <button
            onClick={() => setMobileView("chat")}
            className="text-xs text-indigo-600 font-bold"
          >
            Đóng ✕
          </button>
        </div>

        {/* Header ca làm */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {activeConv.shift.employer_name}
            </span>
            {activeConv.shift.is_sos && (
              <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full animate-pulse">
                🚨 SOS KHẨN CẤP
              </span>
            )}
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
            {activeConv.shift.title}
          </h3>
        </div>

        {/* Thông số ca làm việc */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> Thời gian:
            </span>
            <span className="font-bold text-slate-800">
              {activeConv.shift.shift_start} - {activeConv.shift.shift_end} ({activeConv.shift.duration_hours}h)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-500" /> Tiền công:
            </span>
            <span className="font-black text-emerald-600 text-sm">
              {activeConv.shift.total_budget.toLocaleString("vi-VN")} đ
            </span>
          </div>

          <div className="pt-1.5 border-t border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1 text-[11px] mb-0.5">
              <MapPin className="w-3 h-3 text-rose-500" /> Địa chỉ cơ sở:
            </span>
            <p className="text-[11px] font-semibold text-slate-700">
              {activeConv.shift.location_address}
            </p>
          </div>
        </div>

        {/* TIẾN TRÌNH 5 BƯỚC ỨNG TUYỂN */}
        <div className="border border-slate-200 rounded-2xl p-3 bg-white">
          <ApplicationStepper currentStep={activeConv.step} />
        </div>

        {/* Các nút hành động nhanh */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => onOpenCheckin && onOpenCheckin(activeConv.shift)}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
          >
            <QrCode className="w-4 h-4" />
            <span>Check-in GPS & Quét QR</span>
          </button>

          <button
            type="button"
            onClick={() => alert("Đang mở bản đồ Google Maps chỉ đường tới " + activeConv.shift.location_address)}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Chỉ Đường Tới Quán</span>
          </button>
        </div>
      </div>
    </div>
  );
}
