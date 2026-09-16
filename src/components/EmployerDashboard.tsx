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
  MapPin,
  Sparkles,
  QrCode,
  Calendar,
  History,
  Check,
  XCircle,
  MessageSquare,
  KeyRound,
  ShieldCheck,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Shift, User } from "../domain/types";
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

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newWage, setNewWage] = useState(30000);
  const [newHours, setNewHours] = useState(4);
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
      shift_start: "18:00",
      shift_end: "22:00",
      duration_hours: newHours,
      period: "EVENING",
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
    <div className="p-4 space-y-4">
      {/* Employer Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">The Cuppa Coffee & Tea</h2>
              <span className="text-[11px] text-slate-400">
                142 Hoàng Văn Thụ, TP. Thái Nguyên
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md">
            Doanh nghiệp chuẩn
          </span>
        </div>

        {/* Escrow Balance Preview */}
        <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300">Số dư ký quỹ Escrow PayOS:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-emerald-400">1.250.000 đ</span>
            <button
              onClick={() => {
                setQrAmount(500000);
                setQrContent("NAP QUY ESCROW THE CUPPA");
                setShowQrModal(true);
              }}
              className="text-[10px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
            >
              <QrCode className="w-3 h-3" />
              <span>Nạp QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 SUB-TABS NAVIGATION BAR */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("active_shifts")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
            activeSubTab === "active_shifts"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Tin đang tuyển ({shifts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("new_candidates")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 relative ${
            activeSubTab === "new_candidates"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Ứng viên mới</span>
          {appliedCandidateIds.length > 0 && !approvedCandidate && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("today_roster")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
            activeSubTab === "today_roster"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Lịch làm việc hôm nay</span>
        </button>

        <button
          onClick={() => setActiveSubTab("history")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
            activeSubTab === "history"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Lịch sử & Ký quỹ</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: TIN ĐANG TUYỂN                                 */}
      {/* ======================================================== */}
      {activeSubTab === "active_shifts" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              Các Ca Làm Đang Mở Tuyển ({shifts.length})
            </h3>
            <button
              onClick={() => setShowPostModal(true)}
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Đăng Ca Mới</span>
            </button>
          </div>

          <div className="space-y-3">
            {shifts.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    {s.is_sos && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md uppercase mb-1">
                        <AlertTriangle className="w-3 h-3" /> Ca SOS Khẩn Cấp (+30.000đ)
                      </span>
                    )}
                    <h4 className="text-xs font-bold text-slate-900">{s.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{s.description}</p>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg shrink-0">
                    {s.hourly_wage.toLocaleString("vi-VN")} đ/h
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {s.shift_start} - {s.shift_end} ({s.duration_hours}h)
                    </span>
                    <span>Cần tuyển: {s.required_candidates} bạn</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Đang nhận hồ sơ
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: ỨNG VIÊN MỚI                                  */}
      {/* ======================================================== */}
      {activeSubTab === "new_candidates" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              Ứng Viên Đang Chờ Duyệt (Hồ Sơ Mới)
            </h3>
            <span className="text-xs text-slate-500">
              {rejectedCandidate ? 0 : appliedCandidateIds.length} ứng viên
            </span>
          </div>

          {!rejectedCandidate && appliedCandidateIds.length > 0 ? (
            <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={candidateUser.avatar_url}
                    alt={candidateUser.full_name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-900">
                        {candidateUser.full_name}
                      </h4>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Độ khớp 96%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Sinh viên ĐH Kỹ thuật Công nghiệp (TNUT) • 🔋 Pin uy tín: 100%
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Ứng tuyển ca:{" "}
                      <span className="font-semibold text-slate-700">
                        {shifts[0]?.title || "Phục vụ bàn ca tối The Cuppa"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Kỹ năng & thời gian rảnh của ứng viên */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Kỹ năng đã xác thực:</span>
                  <span className="font-semibold text-slate-800">
                    Phục vụ bàn, Pha chế cơ bản, Giao tiếp STAR
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Khoảng cách đến quán:</span>
                  <span className="font-semibold text-emerald-600">
                    0.8 km (khoảng 3 phút di chuyển)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Kỳ vọng lương:</span>
                  <span className="font-semibold text-indigo-600">30.000 đ/h</span>
                </div>
              </div>

              {/* Hành động phê duyệt */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {onNavigateToMessages && (
                    <button
                      type="button"
                      onClick={onNavigateToMessages}
                      className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Nhắn tin</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setRejectedCandidate(true)}
                    className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Từ chối</span>
                  </button>
                </div>

                {approvedCandidate ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Đã duyệt & Khóa quỹ Escrow
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setQrAmount(153000);
                      setQrContent("KY QUY CA SOS HUY TNUT");
                      setShowQrModal(true);
                    }}
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Duyệt & Ký quỹ VietQR (153k)</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">
                {rejectedCandidate
                  ? "Đã từ chối ứng viên. Không còn hồ sơ chờ duyệt."
                  : "Chưa có ứng viên mới nào nộp đơn."}
              </p>
              <p className="text-[11px] text-slate-400">
                Khi sinh viên bấm ứng tuyển, danh sách sẽ tự động xuất hiện tại đây.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: LỊCH LÀM VIỆC HÔM NAY (TODAY ROSTER)          */}
      {/* ======================================================== */}
      {activeSubTab === "today_roster" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              Lịch Ca Làm Việc Hôm Nay
            </h3>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              Hôm nay, 16/09/2026
            </span>
          </div>

          {/* Venue Check-in PIN Card */}
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-4 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold text-indigo-100">
                  Mã PIN Điểm Danh Dự Phòng Quán:
                </span>
              </div>
              <button
                onClick={handleCopyPin}
                className="text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedPin ? "Đã sao chép" : "Sao chép"}</span>
              </button>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black tracking-widest text-amber-300">
                8866
              </span>
              <span className="text-[11px] text-indigo-200">
                Cung cấp mã PIN này cho ứng viên nếu GPS điện thoại của họ bị chập chờn.
              </span>
            </div>
          </div>

          {/* Active Today Roster Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md uppercase mb-1">
                  <AlertTriangle className="w-3 h-3" /> Ca Tối SOS
                </span>
                <h4 className="text-xs font-bold text-slate-900">
                  {shifts[0]?.title || "Phục vụ bàn ca tối The Cuppa"}
                </h4>
                <p className="text-[11px] text-slate-500">
                  18:00 - 22:00 (4 tiếng) • Bán kính check-in 50m
                </p>
              </div>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Đang trực tuyến
              </span>
            </div>

            {/* Nhân sự nhận ca */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={candidateUser.avatar_url}
                  alt={candidateUser.full_name}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {candidateUser.full_name} (TNUT)
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    ● Sẵn sàng nhận ca lúc 17:55
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-indigo-600 block">
                  128.000 đ
                </span>
                <span className="text-[10px] text-slate-400">Escrow đã nạp</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: LỊCH SỬ TUYỂN DỤNG & KÝ QUỸ ESCROW            */}
      {/* ======================================================== */}
      {activeSubTab === "history" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              Lịch Sử Tuyển Dụng & Giao Dịch Ký Quỹ
            </h3>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Bảo chứng PayOS VietQR
            </span>
          </div>

          <div className="space-y-2">
            {/* Giao dịch 1 */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Ký quỹ ca SOS #shift_sos_01
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    16/09/2026 17:20 • Ứng viên: Nguyễn Đức Huy
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 block">
                  -153.000 đ
                </span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                  Đang giữ Escrow
                </span>
              </div>
            </div>

            {/* Giao dịch 2 */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Nạp tiền vào ví doanh nghiệp
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    15/09/2026 09:15 • Chuyển khoản VietQR PayOS
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-emerald-600 block">
                  +1.000.000 đ
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Thành công
                </span>
              </div>
            </div>

            {/* Giao dịch 3 */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Giải ngân hoàn tất ca làm #shift_prev_09
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    14/09/2026 22:05 • Ứng viên: Trần Mai Anh
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 block">
                  -120.000 đ
                </span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  Đã giải ngân
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Đăng Ca Mới */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="text-base font-black text-slate-900">
              Đăng Ca Làm Việc Mới
            </h3>

            {/* Shift Templates (Mẫu ca định kỳ) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 block">
                💡 Chọn nhanh mẫu ca định kỳ:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setNewTitle("Phục vụ bàn ca tối The Cuppa (18h-22h)");
                    setNewWage(32000);
                    setNewHours(4);
                    setIsSos(false);
                  }}
                  className="text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors"
                >
                  ☕ Phục vụ tối (4h - 32k)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTitle("Pha chế đồ uống ca sáng (7h-11h)");
                    setNewWage(30000);
                    setNewHours(4);
                    setIsSos(false);
                  }}
                  className="text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                >
                  🥤 Pha chế sáng (4h - 30k)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTitle("🚨 GẤP: Bù nhân viên ốm ca tối");
                    setNewWage(35000);
                    setNewHours(4);
                    setIsSos(true);
                  }}
                  className="text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors"
                >
                  🚨 Tuyển SOS (+30k)
                </button>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tiêu đề ca làm việc:
                </label>
                <input
                  type="text"
                  placeholder="VD: Phục vụ khách ca tối The Cuppa"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mức lương (đ/h):
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={newWage}
                    onChange={(e) => setNewWage(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Thời lượng (tiếng):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newHours}
                    onChange={(e) => setNewHours(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* SOS Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200">
                <div>
                  <span className="text-xs font-bold text-rose-900 block">
                    Đánh dấu ca SOS khẩn cấp?
                  </span>
                  <span className="text-[10px] text-rose-600">
                    Thưởng thêm +30.000đ để hút ứng viên ngay
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isSos}
                  onChange={(e) => setIsSos(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Đăng ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MÃ QR THANH TOÁN VIETQR PAYOS */}
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
