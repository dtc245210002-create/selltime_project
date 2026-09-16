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

        if (data.data.length > 0) {
          const lastMsg = data.data[data.data.length - 1];
          setLastMessagesMap((prev) => ({
            ...prev,
            [convId]: { text: lastMsg.content, time: lastMsg.created_at },
          }));
        }

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

  useEffect(() => {
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

    fetchMessages(activeConvId);

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
    } catch (e) {
      console.warn("EventSource setup warning:", e);
    }

    const interval = setInterval(() => {
      fetchMessages(activeConvId, true);
    }, 1500);

    return () => {
      if (es) es.close();
      clearInterval(interval);
    };
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      fetchMessages(activeConvId, true);
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleResetConversation = async () => {
    if (isResetting) return;
    const confirmReset = window.confirm(
      "Làm mới lịch sử cuộc trò chuyện này về trạng thái ban đầu?"
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

  // 1. CỘT 1: DANH SÁCH CUỘC TRÒ CHUYỆN (Dark Surface)
  const renderConversationsList = (isMobileView: boolean) => (
    <div className="w-full h-full flex flex-col bg-slate-950">
      {/* Search header */}
      <div className="p-3 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
            Cuộc trò chuyện
          </h3>
          <span className="text-[10px] font-mono text-purple-300 bg-purple-950/70 border border-purple-800/60 px-1.5 py-0.2 rounded">
            {conversations.length}
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-850">
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
              className={`w-full p-3 flex items-start gap-2.5 text-left transition-colors ${
                isSelected
                  ? "bg-slate-900 border-l-2 border-purple-500"
                  : "hover:bg-slate-900/60"
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={conv.partnerAvatar}
                  alt={conv.partnerName}
                  className="w-9 h-9 rounded-md object-cover border border-slate-700"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-slate-950 rounded-full" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white truncate">
                    {conv.partnerName}
                  </span>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">{displayTime}</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {displayLastMessage}
                </p>
                <span className="inline-block text-[9px] text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded mt-1 truncate max-w-[170px]">
                  {conv.shift.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // 2. CỘT 2: KHUNG TRÒ CHUYỆN CHÍNH
  const renderChatArea = (isMobileView: boolean) => (
    <div className="w-full h-full flex flex-col bg-slate-950 min-w-0">
      {/* Chat Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {isMobileView && (
            <button
              type="button"
              onClick={() => setMobileView("list")}
              className="p-1.5 -ml-1 text-slate-400 hover:text-white rounded-md transition-colors"
              title="Quay lại"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="relative shrink-0">
            <img
              src={activeConv.partnerAvatar}
              alt={activeConv.partnerName}
              className="w-8 h-8 rounded-md object-cover border border-slate-700"
            />
            <span
              className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                {activeConv.partnerName}
              </h4>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
              <span className="text-emerald-400 font-medium">Trực tuyến</span>
              <span>•</span>
              <span className="truncate">{activeConv.partnerRoleTitle}</span>
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleResetConversation}
            disabled={isResetting}
            title="Làm mới hội thoại"
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-purple-400" : ""}`} />
          </button>

          {isMobileView && (
            <button
              type="button"
              onClick={() => setMobileView("details")}
              className="text-[11px] font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 px-2 py-1 rounded-md border border-slate-700 flex items-center gap-1 shrink-0 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Xem ca</span>
            </button>
          )}
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-3 py-1 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span>Cloud P2P trực tuyến</span>
        </div>
        <span className="font-mono text-slate-400">
          {messages.length} tin
        </span>
      </div>

      {/* Chat messages feed */}
      <div className="flex-1 p-3.5 space-y-2.5 overflow-y-auto">
        <div className="text-center my-1">
          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-0.5 rounded-md">
            Ca làm: {activeConv.shift.title} ({activeConv.shift.shift_start} - {activeConv.shift.shift_end})
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
                  className="w-6 h-6 rounded object-cover border border-slate-700 shrink-0 mb-2.5"
                />
              )}

              <div
                className={`flex flex-col ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                {!isMe && (
                  <span className="text-[10px] text-slate-500 ml-1 mb-0.5">
                    {m.sender_name}
                  </span>
                )}

                <div
                  className={`max-w-[85%] rounded-md px-3 py-2 text-xs leading-relaxed ${
                    isMe
                      ? "bg-purple-600 text-white rounded-br-xs"
                      : "bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap select-text">{m.content}</p>
                </div>

                <div className="flex items-center gap-1 text-[9px] text-slate-500 mt-1 px-1 font-mono">
                  <span>{m.created_at}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-purple-400" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Gợi ý nhanh (Quick replies) */}
      <div className="px-3 py-1.5 bg-slate-900/90 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[10px] text-slate-500 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          Gợi ý:
        </span>
        {quickReplies.map((reply, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(reply)}
            className="text-[11px] bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white px-2.5 py-1 rounded-md border border-slate-800 shrink-0 transition-colors"
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
        className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0"
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
          className="flex-1 bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 rounded-md px-3 py-2 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || isSending}
          className="w-9 h-9 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-md transition-colors flex items-center justify-center shrink-0"
          title="Gửi tin nhắn"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );

  // 3. CỘT 3: THÔNG TIN CA LÀM & STEPPER
  const renderShiftDetails = (isMobileView: boolean) => (
    <div className="w-full h-full flex flex-col bg-slate-900 overflow-y-auto p-4 space-y-3.5">
      {/* Header ca làm */}
      <div className="space-y-1">
        {isMobileView && (
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <button
              type="button"
              onClick={() => setMobileView("chat")}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại trò chuyện</span>
            </button>
            <span className="font-semibold text-xs text-slate-400">
              Chi tiết ca
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md">
            {activeConv.shift.employer_name}
          </span>
          {activeConv.shift.is_sos && (
            <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/80 px-2 py-0.5 rounded-md">
              SOS Khẩn Cấp
            </span>
          )}
        </div>
        <h3 className="font-bold text-sm text-white leading-snug">
          {activeConv.shift.title}
        </h3>
      </div>

      {/* Thông số ca làm việc */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> Thời gian:
          </span>
          <span className="font-mono text-slate-200">
            {activeConv.shift.shift_start} - {activeConv.shift.shift_end} ({activeConv.shift.duration_hours}h)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Tiền công:
          </span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {activeConv.shift.total_budget.toLocaleString("vi-VN")} đ
          </span>
        </div>

        <div className="pt-1.5 border-t border-slate-800/80">
          <span className="text-slate-500 flex items-center gap-1 text-[11px] mb-0.5">
            <MapPin className="w-3 h-3 text-slate-500" /> Cơ sở:
          </span>
          <p className="text-[11px] text-slate-300">
            {activeConv.shift.location_address}
          </p>
        </div>
      </div>

      {/* TIẾN TRÌNH 5 BƯỚC ỨNG TUYỂN */}
      <div className="border border-slate-800 rounded-lg p-3 bg-slate-950">
        <ApplicationStepper currentStep={activeConv.step} />
      </div>

      {/* Action buttons */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={() => onOpenCheckin && onOpenCheckin(activeConv.shift)}
          className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-md font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Check-in GPS & Quét QR</span>
        </button>

        <button
          type="button"
          onClick={() => alert("Đang mở bản đồ Google Maps chỉ đường tới " + activeConv.shift.location_address)}
          className="w-full py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-md font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>Chỉ Đường Tới Quán</span>
        </button>
      </div>
    </div>
  );

  // GIAO DIỆN MOBILE: 1 PANEL ĐƠN
  if (isMobile) {
    return (
      <div className="w-full h-full min-h-[560px] bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
        {mobileView === "list" && renderConversationsList(true)}
        {mobileView === "chat" && renderChatArea(true)}
        {mobileView === "details" && renderShiftDetails(true)}
      </div>
    );
  }

  // GIAO DIỆN DESKTOP: 3 CỘT SONG SONG
  return (
    <div className="w-full h-[680px] lg:h-[720px] bg-slate-900 border border-slate-800 rounded-xl flex flex-row overflow-hidden shadow-card">
      <div className="w-[260px] shrink-0 border-r border-slate-800 flex flex-col bg-slate-950">
        {renderConversationsList(false)}
      </div>
      <div className="flex-1 flex flex-col bg-slate-950 min-w-0">
        {renderChatArea(false)}
      </div>
      <div className="w-[300px] shrink-0 border-l border-slate-800 flex flex-col bg-slate-900 overflow-y-auto">
        {renderShiftDetails(false)}
      </div>
    </div>
  );
}
