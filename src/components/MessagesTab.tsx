"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Send,
  CheckCheck,
  Clock,
  ShieldCheck,
  Sparkles,
  Search,
  MapPin,
  QrCode,
  Info,
  ArrowLeft,
  RotateCcw,
  Wifi,
  Wallet,
} from "lucide-react";
import { Shift, User, UserRole } from "../domain/types";
import { MOCK_CANDIDATE_USER, MOCK_EMPLOYER_USER, INITIAL_SHIFTS } from "../application/store";
import { ApplicationStepper, ApplicationStep } from "./ApplicationStepper";
import { useViewMode } from "./ViewModeContext";

export interface ChatMessage {
  id: string;
  conversation_id?: string;
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
  partnerRoleTitle: string;
  defaultLastMessage: string;
  defaultTime: string;
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

  // Danh sách các cuộc trò chuyện
  const conversations: ConversationItem[] = useMemo(
    () => [
      {
        id: "conv_1",
        partnerName: isEmployer ? "Nguyễn Đức Huy (TNUT)" : "Chị Lan (The Cuppa Coffee)",
        partnerAvatar: isEmployer
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
        partnerRoleTitle: isEmployer
          ? "SV ĐH Kỹ thuật Công nghiệp (TNUT)"
          : "The Cuppa Coffee (Đã Ký quỹ Escrow)",
        defaultLastMessage: "Chị đã nạp ký quỹ Escrow PayOS rồi nhé!",
        defaultTime: "17:20",
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
        partnerRoleTitle: isEmployer
          ? "SV ĐH Sư Phạm Thái Nguyên"
          : "Circle K Cửa hàng Tiện lợi",
        defaultLastMessage: "Ca chiều 12h30 em có thể đến nhận ca được không?",
        defaultTime: "Hôm qua",
        shift: INITIAL_SHIFTS[2], // Circle K
        step: "REVIEWING",
      },
      {
        id: "conv_3",
        partnerName: isEmployer ? "Lê Hoàng Nam (Nông Lâm)" : "Quán Ding Tea Thái Nguyên",
        partnerAvatar: isEmployer
          ? "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=100&auto=format&fit=crop&q=80",
        partnerRoleTitle: isEmployer
          ? "SV ĐH Nông Lâm Thái Nguyên"
          : "Ding Tea Trà sữa & Đồ uống",
        defaultLastMessage: "Đã xác nhận ca làm việc tối nay 17h30",
        defaultTime: "10/09",
        shift: INITIAL_SHIFTS[1], // Ding Tea
        step: "ACCEPTED",
      },
    ],
    [isEmployer]
  );

  const { isMobile } = useViewMode();
  const [activeConvId, setActiveConvId] = useState<string>("conv_1");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastMessagesMap, setLastMessagesMap] = useState<Record<string, { text: string; time: string }>>({});
  const [inputVal, setInputVal] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat" | "details">("list");
  const [isConnected, setIsConnected] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  // Quick replies tùy chỉnh theo vai trò
  const quickReplies = isEmployer
    ? [
        "Chào em, em qua quán trước 10 phút nhận đồng phục nhé!",
        "Em đến quán cứ vào quầy thu ngân gặp chị nha.",
        "Chị đã nạp ký quỹ Escrow rồi, xong ca nhận tiền ngay nhé!",
        "Em làm tốt lắm, chị gửi đánh giá 5 sao cho em nhé!",
      ]
    : [
        "Dạ em chào chị, em đã đến trước cửa quán rồi ạ!",
        "Em vừa học xong ở TNUT, em chạy qua quán 5 phút nữa tới ạ.",
        "Chị ơi mã PIN check-in tại quầy hôm nay là 8866 đúng không ạ?",
        "Em vừa bấm check-out hoàn thành ca rồi ạ, cảm ơn chị!",
      ];

  // Tải tin nhắn từ API và cập nhật state
  const fetchMessages = async (convId: string, silent = false) => {
    try {
      const res = await fetch(`/api/messages?conversation_id=${convId}&t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) return;

      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setIsConnected(true);
        if (convId === activeConvId) {
          setMessages(data.data);
        }

        // Cập nhật tin nhắn xem trước ở danh sách bên trái
        if (data.data.length > 0) {
          const lastMsg = data.data[data.data.length - 1];
          setLastMessagesMap((prev) => ({
            ...prev,
            [convId]: { text: lastMsg.content, time: lastMsg.created_at },
          }));
        }

        // Lưu local cache
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem(`selltime_chat_${convId}`, JSON.stringify(data.data));
          }
        } catch (e) {}
      }
    } catch (err) {
      if (!silent) console.warn("Lỗi fetch tin nhắn:", err);
      setIsConnected(false);
    }
  };

  // Khởi tạo và lắng nghe SSE Real-time + Polling fallback
  useEffect(() => {
    // 1. Khôi phục từ localStorage trước để hiển thị tức thì
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`selltime_chat_${activeConvId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (e) {}
    }

    // 2. Fetch ngay lập tức từ server
    fetchMessages(activeConvId);

    // 3. Kết nối SSE Real-time qua Cloud Hub (ntfy.sh)
    let es: EventSource | null = null;
    try {
      const topic = `selltime_v1_chat_${activeConvId.replace(/[^a-zA-Z0-9_]/g, "")}`;
      es = new EventSource(`https://ntfy.sh/${topic}/sse`);

      es.onopen = () => {
        setIsConnected(true);
      };

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event === "message" && parsed.message) {
            const incoming: ChatMessage = JSON.parse(parsed.message);
            if (incoming && incoming.id && incoming.content) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === incoming.id)) return prev;
                const updated = [...prev, incoming];
                try {
                  localStorage.setItem(`selltime_chat_${activeConvId}`, JSON.stringify(updated));
                } catch (e) {}
                return updated;
              });

              setLastMessagesMap((prev) => ({
                ...prev,
                [activeConvId]: { text: incoming.content, time: incoming.created_at },
              }));
            }
          }
        } catch (e) {}
      };

      es.onerror = () => {
        // Tự động thử lại khi mất mạng
      };
    } catch (e) {
      console.warn("EventSource setup warning:", e);
    }

    // 4. Polling dự phòng mỗi 1500ms
    const interval = setInterval(() => {
      fetchMessages(activeConvId, true);
    }, 1500);

    return () => {
      if (es) es.close();
      clearInterval(interval);
    };
  }, [activeConvId]);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Xử lý gửi tin nhắn (Optimistic UI tức thì + Sync Cloud)
  const handleSend = async (contentToSend?: string) => {
    const text = (contentToSend || inputVal).trim();
    if (!text || isSending) return;

    setIsSending(true);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const tempId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newMsg: ChatMessage = {
      id: tempId,
      conversation_id: activeConvId,
      sender_id: myUser.id,
      sender_name: myUser.full_name,
      sender_avatar: myUser.avatar_url || "",
      content: text,
      created_at: timeStr,
    };

    // Cập nhật giao diện ngay lập tức
    setMessages((prev) => [...prev, newMsg]);
    setLastMessagesMap((prev) => ({
      ...prev,
      [activeConvId]: { text: newMsg.content, time: newMsg.created_at },
    }));
    setInputVal("");

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });
      // Tải lại để đồng bộ chính xác
      fetchMessages(activeConvId, true);
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Làm mới lịch sử tin nhắn về mặc định (tiện dụng khi demo kiểm thử)
  const handleResetConversation = async () => {
    if (isResetting) return;
    const confirmReset = window.confirm(
      "Bạn có chắc muốn làm mới lịch sử cuộc trò chuyện này về trạng thái ban đầu không?"
    );
    if (!confirmReset) return;

    setIsResetting(true);
    try {
      const res = await fetch(`/api/messages?conversation_id=${activeConvId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setMessages(data.data);
        if (typeof window !== "undefined") {
          localStorage.removeItem(`selltime_chat_${activeConvId}`);
        }
      }
    } catch (err) {
      console.error("Lỗi reset chat:", err);
    } finally {
      setIsResetting(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 1. CỘT 1: DANH SÁCH CUỘC TRÒ CHUYỆN
  const renderConversationsList = (isMobileView: boolean) => (
    <div className="w-full h-full flex flex-col bg-slate-50/50">
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
            className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* List of chats */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredConversations.map((conv) => {
          const isSelected = conv.id === activeConvId;
          const dynamicLast = lastMessagesMap[conv.id];
          const displayLastMessage = dynamicLast ? dynamicLast.text : conv.defaultLastMessage;
          const displayTime = dynamicLast ? dynamicLast.time : conv.defaultTime;

          return (
            <button
              key={conv.id}
              type="button"
              onClick={() => {
                setActiveConvId(conv.id);
                if (isMobileView) {
                  setMobileView("chat");
                }
              }}
              className={`w-full p-3 flex items-start gap-2.5 text-left transition-all ${
                isSelected
                  ? "bg-indigo-50/80 border-l-4 border-indigo-600 shadow-2xs"
                  : "hover:bg-white"
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={conv.partnerAvatar}
                  alt={conv.partnerName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                {conv.unreadCount && isSelected === false && (
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
                  <span className="text-[10px] text-slate-400 shrink-0">{displayTime}</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {displayLastMessage}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-block text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded truncate max-w-[170px]">
                    {conv.shift.title}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // 2. CỘT 2: KHUNG TRÒ CHUYỆN CHÍNH
  const renderChatArea = (isMobileView: boolean) => (
    <div className="w-full h-full flex flex-col bg-slate-50 min-w-0">
      {/* Chat Header */}
      <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          {isMobileView && (
            <button
              type="button"
              onClick={() => setMobileView("list")}
              className="min-w-[44px] min-h-[44px] -ml-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl flex items-center justify-center text-xs font-bold transition-colors"
              title="Quay lại danh sách hội thoại"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative shrink-0">
            <img
              src={activeConv.partnerAvatar}
              alt={activeConv.partnerName}
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                isConnected ? "bg-emerald-500" : "bg-amber-400"
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {activeConv.partnerName}
              </h4>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </div>
            <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium truncate">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>Đang trực tuyến</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 truncate">{activeConv.partnerRoleTitle}</span>
            </p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Nút Làm mới hội thoại */}
          <button
            type="button"
            onClick={handleResetConversation}
            disabled={isResetting}
            title="Làm mới cuộc hội thoại về ban đầu"
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <RotateCcw className={`w-4 h-4 ${isResetting ? "animate-spin text-indigo-600" : ""}`} />
          </button>

          {isMobileView && (
            <button
              type="button"
              onClick={() => setMobileView("details")}
              className="text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-xl border border-indigo-100 flex items-center gap-1 shrink-0 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Xem ca</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time status sub-banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-indigo-50/60 border-b border-slate-200/60 px-3 py-1 flex items-center justify-between text-[10px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3 text-emerald-600" />
          <span className="font-semibold text-emerald-700">Đồng bộ Cloud P2P trực tuyến</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">2 thiết bị kết nối tức thì</span>
        </div>
        <span className="text-[9px] text-indigo-600 font-bold bg-white px-2 py-0.5 rounded-full border border-indigo-100 shadow-2xs">
          {messages.length} tin nhắn
        </span>
      </div>

      {/* Chat messages feed */}
      <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
        <div className="text-center my-1">
          <span className="text-[10px] bg-slate-200/80 text-slate-600 px-3 py-1 rounded-full font-medium shadow-2xs">
            Kênh trao đổi ca làm: {activeConv.shift.title} ({activeConv.shift.shift_start} - {activeConv.shift.shift_end})
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
                {!isMe && (
                  <span className="text-[10px] font-bold text-slate-500 ml-1 mb-0.5">
                    {m.sender_name}
                  </span>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs leading-relaxed transition-all ${
                    isMe
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none"
                      : "bg-white text-slate-800 rounded-bl-none border border-slate-200/80"
                  }`}
                >
                  <p className="whitespace-pre-wrap select-text">{m.content}</p>
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
        <span className="text-[10px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          Gợi ý:
        </span>
        {quickReplies.map((reply, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(reply)}
            className="text-[11px] font-medium bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-2.5 py-1 rounded-full border border-slate-200 shrink-0 transition-all shadow-2xs active:scale-95"
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
              ? `Nhắn tin cho ứng viên ${activeConv.partnerName}...`
              : `Nhắn tin với ${activeConv.partnerName}...`
          }
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 bg-slate-100 border border-slate-200 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || isSending}
          className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center shrink-0"
          title="Gửi tin nhắn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );

  // 3. CỘT 3: THÔNG TIN CA LÀM & STEPPER 5 BƯỚC
  const renderShiftDetails = (isMobileView: boolean) => (
    <div className="w-full h-full flex flex-col bg-white overflow-y-auto p-4 space-y-4">
      {/* Header ca làm */}
      <div className="space-y-1.5">
        {isMobileView && (
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={() => setMobileView("chat")}
              className="min-h-[44px] px-2 -ml-2 text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại trò chuyện</span>
            </button>
            <span className="font-bold text-xs text-slate-500">
              Chi tiết ca làm
            </span>
          </div>
        )}

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
  );

  // GIAO DIỆN MOBILE: CHỈ HIỂN THỊ 1 PANEL ĐƠN DUY NHẤT
  if (isMobile) {
    return (
      <div className="w-full h-full min-h-[580px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {mobileView === "list" && renderConversationsList(true)}
        {mobileView === "chat" && renderChatArea(true)}
        {mobileView === "details" && renderShiftDetails(true)}
      </div>
    );
  }

  // GIAO DIỆN DESKTOP: HIỂN THỊ ĐỦ 3 CỘT SONG SONG
  return (
    <div className="w-full h-[700px] lg:h-[750px] bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-row overflow-hidden">
      <div className="w-[280px] shrink-0 border-r border-slate-200 flex flex-col bg-slate-50/50">
        {renderConversationsList(false)}
      </div>
      <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
        {renderChatArea(false)}
      </div>
      <div className="w-[320px] shrink-0 border-l border-slate-200 flex flex-col bg-white overflow-y-auto p-4 space-y-4">
        {renderShiftDetails(false)}
      </div>
    </div>
  );
}
