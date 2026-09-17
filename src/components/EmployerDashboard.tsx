"use client";

import React, { useState } from "react";
import {
  Building2,
  PlusCircle,
  AlertTriangle,
  Users,
  CheckCircle2,
  Wallet,
  Clock,
  QrCode,
  Calendar,
  History,
  XCircle,
  MessageSquare,
  KeyRound,
  ShieldCheck,
  Copy,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Shift, User, ShiftPeriod } from "../domain/types";
import { PaymentQrModal } from "./PaymentQrModal";

interface EmployerDashboardProps {
  shifts: Shift[];
  appliedCandidateIds: string[];
  candidateUser: User;
  onPostNewShift: (newShift: Shift) => void;
  onNavigateToMessages?: () => void;
}

export function EmployerDashboard({
  shifts,
  appliedCandidateIds,
  candidateUser,
  onPostNewShift,
  onNavigateToMessages,
}: EmployerDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "active_shifts" | "new_candidates" | "today_roster" | "history"
  >("active_shifts");

  const [showPostModal, setShowPostModal] = useState(false);
  const [approvedCandidate, setApprovedCandidate] = useState(false);
  const [rejectedCandidate, setRejectedCandidate] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrAmount, setQrAmount] = useState(153000);
  const [qrContent, setQrContent] = useState("SELLTIME SOS 01");
  const [copiedPin, setCopiedPin] = useState(false);
  const [escrowFilter, setEscrowFilter] = useState<"ALL" | "HELD" | "RELEASED" | "REFUNDED">("ALL");

  const escrowLedgerData = [
    {
      id: "tx_01",
      code: "ESC-20260916-01",
      type: "HELD" as const,
      title: "Ký quỹ ca SOS #shift_sos_01",
      detail: "The Cuppa • Pha chế khẩn cấp 4h",
      counterparty: "Nguyễn Đức Huy (TNUT)",
      amount: -153000,
      date: "16/09/2026 17:30",
      statusBadge: "Đang giữ Escrow",
      statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      id: "tx_02",
      code: "ESC-20260915-02",
      type: "RELEASED" as const,
      title: "Giải ngân ca Phục vụ tối #shift_02",
      detail: "Hoàn thành 5 sao • Quẹt QR hợp lệ",
      counterparty: "Trần Mai Anh (ĐHSP)",
      amount: -120000,
      date: "15/09/2026 22:15",
      statusBadge: "Đã giải ngân VietQR",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      id: "tx_03",
      code: "ESC-20260915-01",
      type: "TOPUP" as const,
      title: "Nạp quỹ bảo chứng PayOS",
      detail: "Napas 24/7 • MBBank 0988888888",
      counterparty: "Hệ thống PayOS Gateway",
      amount: 1000000,
      date: "15/09/2026 14:00",
      statusBadge: "Nạp thành công",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      id: "tx_04",
      code: "ESC-20260914-03",
      type: "REFUNDED" as const,
      title: "Hoàn tiền ký quỹ ca Hủy hợp lệ",
      detail: "Ứng viên báo bận trước 16h (miễn phạt)",
      counterparty: "Quỹ hoàn trả Sell Time",
      amount: 120000,
      date: "14/09/2026 09:10",
      statusBadge: "Đã hoàn quỹ",
      statusColor: "text-slate-400 bg-slate-800/40 border-slate-700/40",
    },
  ];

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newWage, setNewWage] = useState(30000);
  const [newHours, setNewHours] = useState(4);
  const [newStart, setNewStart] = useState("18:00");
  const [newEnd, setNewEnd] = useState("22:00");
  const [newPeriod, setNewPeriod] = useState<ShiftPeriod>("EVENING");
  const [isSos, setIsSos] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: Shift = {
      id: `shift_${Date.now()}`,
      employer_id: "user_emp_lan_02",
      employer_name: "The Cuppa Coffee",
      employer_avatar:
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&auto=format&fit=crop&q=80",
      title: newTitle,
      description: "Ca làm việc đăng từ chế độ Nhà tuyển dụng Sell Time",
      work_type: "PART_TIME",
      shift_date: "Hôm nay",
      shift_start: newStart,
      shift_end: newEnd,
      duration_hours: newHours,
      period: newPeriod,
      hourly_wage: newWage,
      total_budget: newWage * newHours,
      required_candidates: 1,
      filled_candidates: 0,
      is_sos: isSos,
      sos_bonus_amount: isSos ? 30000 : 0,
      required_skills: ["Phục vụ bàn"],
      location_coords: {
        latitude: 21.593,
        longitude: 105.834,
      },
      location_address: "142 Hoàng Văn Thụ, TP. Thái Nguyên",
      status: "OPEN",
      created_at: new Date().toISOString(),
    };

    onPostNewShift(created);
    setNewTitle("");
    setShowPostModal(false);
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText("8866");
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div className="p-4 space-y-3.5 max-w-3xl mx-auto">
      {/* Employer Top Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-flat">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">The Cuppa Coffee & Tea</h2>
              <span className="text-[11px] text-slate-400">
                142 Hoàng Văn Thụ, TP. Thái Nguyên
              </span>
            </div>
          </div>
          <span className="text-[10px] font-medium bg-slate-950 text-emerald-400 border border-slate-800 px-2 py-0.5 rounded-md">
            Doanh nghiệp eKYC
          </span>
        </div>

        {/* Escrow Balance Preview */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">Số dư ký quỹ Escrow:</span>
            <span className="text-sm font-bold font-mono text-emerald-400">1.250.000 đ</span>
          </div>
          <button
            onClick={() => {
              setQrAmount(500000);
              setQrContent("NAP QUY ESCROW THE CUPPA");
              setShowQrModal(true);
            }}
            className="text-[11px] font-medium bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Nạp QR</span>
          </button>
        </div>
      </div>

      {/* 4 SUB-TABS NAVIGATION BAR */}
      <div className="bg-slate-950 rounded-lg p-1 border border-slate-800 flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("active_shifts")}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shrink-0 ${
            activeSubTab === "active_shifts"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Tin đang tuyển ({shifts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("new_candidates")}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shrink-0 relative ${
            activeSubTab === "new_candidates"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Ứng viên mới</span>
          {appliedCandidateIds.length > 0 && !approvedCandidate && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("today_roster")}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shrink-0 ${
            activeSubTab === "today_roster"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Lịch hôm nay</span>
        </button>

        <button
          onClick={() => setActiveSubTab("history")}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shrink-0 ${
            activeSubTab === "history"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Lịch sử Escrow</span>
        </button>
      </div>

      {/* SUB-TAB 1: TIN ĐANG TUYỂN */}
      {activeSubTab === "active_shifts" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Ca Làm Đang Mở ({shifts.length})
            </h3>
            <button
              onClick={() => setShowPostModal(true)}
              className="text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Đăng Ca Mới</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {shifts.map((s) => (
              <div
                key={s.id}
                className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    {s.is_sos && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold bg-rose-950/70 border border-rose-800/80 text-rose-300 px-1.5 py-0.2 rounded-md uppercase mb-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" /> SOS (+30k)
                      </span>
                    )}
                    <h4 className="text-xs font-bold text-white">{s.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{s.description}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md shrink-0">
                    {s.hourly_wage.toLocaleString("vi-VN")} đ/h
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800 gap-2 font-mono">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {s.shift_start} - {s.shift_end} ({s.duration_hours}h)
                    </span>
                    <span>Cần: {s.required_candidates} bạn</span>
                  </div>

                  <span className="text-[10px] font-sans font-medium text-emerald-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                    Đang nhận đơn
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ỨNG VIÊN MỚI */}
      {activeSubTab === "new_candidates" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Ứng Viên Chờ Duyệt
            </h3>
            <span className="text-xs font-mono text-slate-500">
              {rejectedCandidate ? 0 : appliedCandidateIds.length} hồ sơ
            </span>
          </div>

          {!rejectedCandidate && appliedCandidateIds.length > 0 ? (
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={candidateUser.avatar_url}
                    alt={candidateUser.full_name}
                    className="w-11 h-11 rounded-lg object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">
                        {candidateUser.full_name}
                      </h4>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-950/70 border border-purple-800/60 px-1.5 py-0.2 rounded">
                        96% Khớp
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      ĐH TNUT • 🔋 Pin: 100%
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Ứng tuyển: <span className="text-slate-300">{shifts[0]?.title || "Ca tối The Cuppa"}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Kỹ năng:</span>
                  <span className="text-slate-300">Phục vụ bàn, Pha chế, Thu ngân</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Khoảng cách:</span>
                  <span className="text-emerald-400 font-mono">0.8 km (~3 phút)</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Kỳ vọng lương:</span>
                  <span className="text-slate-200 font-mono">30.000 đ/h</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  {onNavigateToMessages && (
                    <button
                      type="button"
                      onClick={onNavigateToMessages}
                      className="text-xs font-medium text-slate-300 bg-slate-950 hover:bg-slate-850 border border-slate-800 px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Nhắn tin</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setRejectedCandidate(true)}
                    className="text-xs font-medium text-rose-400 hover:text-rose-300 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Từ chối</span>
                  </button>
                </div>

                {approvedCandidate ? (
                  <span className="text-xs font-medium text-emerald-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Đã duyệt & Ký quỹ
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setQrAmount(153000);
                      setQrContent("KY QUY CA SOS HUY TNUT");
                      setShowQrModal(true);
                    }}
                    className="text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Duyệt & Ký quỹ (153k)</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-xl p-8 text-center border border-slate-800 space-y-1.5">
              <Users className="w-7 h-7 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">
                {rejectedCandidate ? "Đã từ chối ứng viên." : "Chưa có ứng viên mới."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: LỊCH HÔM NAY & MÃ PIN */}
      {activeSubTab === "today_roster" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Lịch Ca Làm Việc Hôm Nay
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              16/09/2026
            </span>
          </div>

          {/* PIN Card */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-medium text-slate-300">
                  Mã PIN Điểm Danh Quán:
                </span>
              </div>
              <button
                onClick={handleCopyPin}
                className="text-[11px] text-slate-300 hover:text-white bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedPin ? "Đã chép" : "Sao chép"}</span>
              </button>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-mono font-bold tracking-widest text-purple-400">
                8866
              </span>
              <span className="text-[11px] text-slate-400">
                Cung cấp mã PIN nếu GPS điện thoại ứng viên chập chờn.
              </span>
            </div>
          </div>

          {/* Active Roster */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-semibold text-rose-400 bg-slate-950 border border-slate-800 px-1.5 py-0.2 rounded uppercase">
                  Ca Tối SOS
                </span>
                <h4 className="text-xs font-bold text-white mt-1">
                  {shifts[0]?.title || "Phục vụ bàn ca tối The Cuppa"}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  18:00 - 22:00 (4 tiếng)
                </p>
              </div>

              <span className="text-[10px] font-medium text-emerald-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                Trực tuyến
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={candidateUser.avatar_url}
                  alt={candidateUser.full_name}
                  className="w-7 h-7 rounded-md object-cover border border-slate-700"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    {candidateUser.full_name}
                  </span>
                  <span className="text-[10px] text-emerald-400">
                    Sẵn sàng nhận ca lúc 17:55
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold font-mono text-slate-200 block">
                  153.000 đ
                </span>
                <span className="text-[10px] text-slate-500">Escrow đã nạp</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: LỊCH SỬ KÝ QUỸ */}
      {activeSubTab === "history" && (
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Sổ Quỹ Bảo Đảm Tiền Lương 🛡️
              </h3>
              <p className="text-[10px] text-slate-400">
                Sell Time giữ hộ tiền công an toàn cho nhân viên của quán
              </p>
            </div>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono text-[11px] bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PayOS Napas 24/7
            </span>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900/90 border border-amber-500/20 p-2.5 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Đang giữ hộ an toàn</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold font-mono text-amber-400">153.000 đ</span>
                <span className="text-[10px] text-slate-500 font-mono">(1 ca)</span>
              </div>
            </div>
            <div className="bg-slate-900/90 border border-emerald-500/20 p-2.5 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Đã thanh toán cho nhân viên</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold font-mono text-emerald-400">120.000 đ</span>
                <span className="text-[10px] text-slate-500 font-mono">(1 ca)</span>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {[
              { key: "ALL", label: "Tất cả" },
              { key: "HELD", label: "Đang giữ hộ" },
              { key: "RELEASED", label: "Đã thanh toán" },
              { key: "REFUNDED", label: "Đã hoàn lại" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setEscrowFilter(tab.key as any)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors ${
                  escrowFilter === tab.key
                    ? "bg-purple-600 text-white"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Transaction List */}
          <div className="space-y-2">
            {escrowLedgerData
              .filter((item) => {
                if (escrowFilter === "ALL") return true;
                return item.type === escrowFilter;
              })
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        {item.type === "HELD" && <Clock className="w-4 h-4 text-amber-400" />}
                        {item.type === "RELEASED" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {item.type === "TOPUP" && <ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
                        {item.type === "REFUNDED" && <RefreshCw className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.detail}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {item.date} • Đối tác: {item.counterparty}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold font-mono block ${
                          item.amount > 0 ? "text-emerald-400" : "text-slate-200"
                        }`}
                      >
                        {item.amount > 0 ? `+${item.amount.toLocaleString("vi-VN")} đ` : `${item.amount.toLocaleString("vi-VN")} đ`}
                      </span>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-medium border mt-1 ${item.statusColor}`}
                      >
                        {item.statusBadge}
                      </span>
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Mã GD: {item.code}</span>
                    <span className="text-slate-400">VietQR NAPAS</span>
                  </div>
                </div>
              ))}

            {escrowLedgerData.filter((item) => {
              if (escrowFilter === "ALL") return true;
              return item.type === escrowFilter;
            }).length === 0 && (
              <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 text-center space-y-2">
                <Filter className="w-6 h-6 text-slate-500 mx-auto opacity-60" />
                <p className="text-xs text-slate-400">
                  Không tìm thấy giao dịch nào ở trạng thái này.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Đăng Ca Mới */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-slate-900 w-full max-w-md rounded-xl p-5 border border-slate-800 shadow-modal space-y-3.5 relative">
            <button
              onClick={() => setShowPostModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-white">
              Đăng Ca Làm Việc Mới
            </h3>

            {/* Mẫu ca */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Mẫu ca nhanh:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setNewTitle("Phục vụ bàn ca tối The Cuppa (18h-22h)");
                    setNewWage(32000);
                    setNewHours(4);
                    setNewStart("18:00");
                    setNewEnd("22:00");
                    setNewPeriod("EVENING");
                    setIsSos(false);
                  }}
                  className="text-[11px] bg-slate-950 hover:bg-slate-850 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
                >
                  Phục vụ tối (4h - 32k)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTitle("Pha chế đồ uống ca sáng (7h-11h)");
                    setNewWage(30000);
                    setNewHours(4);
                    setNewStart("07:00");
                    setNewEnd("11:00");
                    setNewPeriod("MORNING");
                    setIsSos(false);
                  }}
                  className="text-[11px] bg-slate-950 hover:bg-slate-850 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
                >
                  Pha chế sáng (4h - 30k)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTitle("🚨 GẤP: Bù nhân viên ốm ca tối");
                    setNewWage(35000);
                    setNewHours(4);
                    setNewStart("18:00");
                    setNewEnd("22:00");
                    setNewPeriod("EVENING");
                    setIsSos(true);
                  }}
                  className="text-[11px] bg-rose-950/70 text-rose-300 border border-rose-800/80 px-2 py-0.5 rounded-md"
                >
                  Tuyển SOS (+30k)
                </button>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Tiêu đề ca làm việc:
                </label>
                <input
                  type="text"
                  placeholder="VD: Phục vụ khách ca tối The Cuppa"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-md p-2 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Khung ca:
                  </label>
                  <select
                    value={newPeriod}
                    onChange={(e) => {
                      const p = e.target.value as ShiftPeriod;
                      setNewPeriod(p);
                      if (p === "MORNING") { setNewStart("07:00"); setNewEnd("11:00"); }
                      else if (p === "AFTERNOON") { setNewStart("13:00"); setNewEnd("17:00"); }
                      else if (p === "EVENING") { setNewStart("18:00"); setNewEnd("22:00"); }
                      else if (p === "NIGHT") { setNewStart("22:00"); setNewEnd("02:00"); }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-md p-2 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="MORNING" className="bg-slate-900">Sáng (07h-11h)</option>
                    <option value="AFTERNOON" className="bg-slate-900">Chiều (13h-17h)</option>
                    <option value="EVENING" className="bg-slate-900">Tối (18h-22h)</option>
                    <option value="NIGHT" className="bg-slate-900">Đêm (22h-02h)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Bắt đầu - kết thúc:
                  </label>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <input
                      type="text"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-md p-2 text-center"
                    />
                    <span className="text-slate-500">-</span>
                    <input
                      type="text"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-md p-2 text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Lương (đ/h):
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={newWage}
                    onChange={(e) => setNewWage(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-md p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Thời lượng (h):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newHours}
                    onChange={(e) => setNewHours(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-md p-2 font-mono"
                  />
                </div>
              </div>

              {/* SOS checkbox */}
              <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-xs font-medium text-white block">
                    Đánh dấu ca SOS khẩn cấp?
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Thưởng thêm +30.000đ hút ứng viên
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isSos}
                  onChange={(e) => setIsSos(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-md shadow-sm"
                >
                  Đăng ca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR VietQR PayOS */}
      <PaymentQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        amount={qrAmount}
        content={qrContent}
        title={
          qrContent.includes("NAP")
            ? "Nạp Tiền Ví Ký Quỹ Escrow"
            : "Ký Quỹ VietQR Cho Ca Làm SOS"
        }
        onPaymentSuccess={() => {
          if (!qrContent.includes("NAP")) {
            setApprovedCandidate(true);
          }
        }}
      />
    </div>
  );
}
