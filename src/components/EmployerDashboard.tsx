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
} from "lucide-react";
import { Shift, User } from "../domain/types";
import { PaymentQrModal } from "./PaymentQrModal";

interface EmployerDashboardProps {
  shifts: Shift[];
  appliedCandidateIds: string[];
  candidateUser: User;
  onPostNewShift: (newShift: Shift) => void;
}

export function EmployerDashboard({
  shifts,
  appliedCandidateIds,
  candidateUser,
  onPostNewShift,
}: EmployerDashboardProps) {
  const [showPostModal, setShowPostModal] = useState(false);
  const [approvedCandidate, setApprovedCandidate] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrAmount, setQrAmount] = useState(153000);
  const [qrContent, setQrContent] = useState("SELLTIME SOS 01");

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
      employer_avatar: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&auto=format&fit=crop&q=80",
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

  return (
    <div className="p-4 space-y-4">
      {/* Employer Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">The Cuppa Coffee & Tea</h2>
              <span className="text-[11px] text-slate-400">142 Hoàng Văn Thụ, Thái Nguyên</span>
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

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900">
          Danh Sách Ca Làm Đang Mở ({shifts.length})
        </h3>
        <button
          onClick={() => setShowPostModal(true)}
          className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Đăng Ca Mới</span>
        </button>
      </div>

      {/* Applied Candidate Review Box */}
      {appliedCandidateIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
              <Users className="w-4 h-4 text-amber-600" /> Có ứng viên vừa ứng tuyển!
            </span>
            <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
              Matching: 96%
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src={candidateUser.avatar_url}
                alt={candidateUser.full_name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  {candidateUser.full_name}
                </h4>
                <p className="text-[10px] text-slate-500">
                  SV TNUT • 🔋 Pin uy tín: 100%
                </p>
              </div>
            </div>

            {approvedCandidate ? (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã duyệt & Ký quỹ
              </span>
            ) : (
              <button
                onClick={() => {
                  setQrAmount(153000);
                  setQrContent("KY QUY CA SOS HUY TNUT");
                  setShowQrModal(true);
                }}
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Duyệt & Ký quỹ VietQR</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Shifts List */}
      <div className="space-y-3">
        {shifts.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2"
          >
            <div className="flex items-start justify-between">
              <div>
                {s.is_sos && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md uppercase mb-1">
                    <AlertTriangle className="w-3 h-3" /> Ca SOS Khẩn Cấp
                  </span>
                )}
                <h4 className="text-xs font-bold text-slate-900">{s.title}</h4>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                {s.hourly_wage.toLocaleString("vi-VN")} đ/h
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>
                {s.shift_start} - {s.shift_end} ({s.duration_hours}h)
              </span>
              <span>Cần: {s.required_candidates} bạn</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Đăng Ca Mới */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4">
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
        title={qrContent.includes("NAP") ? "Nạp Tiền Ví Ký Quỹ Escrow" : "Ký Quỹ VietQR Cho Ca Làm SOS"}
        onPaymentSuccess={() => {
          if (!qrContent.includes("NAP")) {
            setApprovedCandidate(true);
          }
        }}
      />
    </div>
  );
}
