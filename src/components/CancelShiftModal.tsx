"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  RotateCcw,
} from "lucide-react";
import { Shift } from "../domain/types";
import { calculateCancellationPenalty, PenaltyResult } from "../domain/trust-battery";

interface CancelShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift | null;
  appliedAtTimestamp?: number;
  onConfirmCancel: (shiftId: string, penalty: PenaltyResult, reason: string) => void;
}

const REASONS = [
  "Ấn nhầm ca làm (Hủy trong 1 giờ)",
  "Bận lịch học / Thi đột xuất tại trường",
  "Trùng với ca làm khác đã nhận",
  "Có việc gia đình đột xuất",
  "Khoảng cách di chuyển quá xa",
];

export function CancelShiftModal({
  isOpen,
  onClose,
  shift,
  appliedAtTimestamp,
  onConfirmCancel,
}: CancelShiftModalProps) {
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [customReason, setCustomReason] = useState("");

  if (!isOpen || !shift) return null;

  // Tính toán thời gian kể từ khi bấm nhận ca
  const now = Date.now();
  const appliedTime = appliedAtTimestamp || now;
  const minutesSinceBooking = Math.max(0, Math.floor((now - appliedTime) / (1000 * 60)));
  const isGracePeriod = minutesSinceBooking <= 60;

  // Tính số giờ trước ca làm (Giả lập hôm nay ca bắt đầu lúc shift_start)
  const penalty = calculateCancellationPenalty(4, minutesSinceBooking);

  const handleCancel = () => {
    const finalReason = customReason.trim() ? customReason : selectedReason;
    onConfirmCancel(shift.id, penalty, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-modal relative">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tiêu đề modal */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400 shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Xác Nhận Hủy Ca Làm</h3>
            <p className="text-[11px] text-slate-400">
              Kiểm tra quyền ân hạn và chính sách trừ Pin Uy Tín
            </p>
          </div>
        </div>

        {/* Thông tin ca làm bị hủy */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="font-semibold text-white truncate">{shift.employer_name}</span>
          </div>
          <p className="text-slate-300 font-medium text-xs">{shift.title}</p>
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] pt-1 border-t border-slate-800/80">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {shift.shift_start} - {shift.shift_end} ({shift.duration_hours}h)
            </span>
            <span className="text-emerald-400 font-bold ml-auto">
              {shift.total_budget.toLocaleString("vi-VN")} đ
            </span>
          </div>
        </div>

        {/* Banner Ân hạn 1 giờ (Grace Period Notice) */}
        {isGracePeriod ? (
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>⚡ Ân Hạn 1 Giờ Khi Ấn Nhầm (Miễn Phạt 0%)</span>
            </div>
            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
              Bạn vừa nhận ca cách đây <strong>{minutesSinceBooking} phút</strong> (dưới 60 phút). Bạn được hủy miễn phí mà <strong>không bị trừ Pin Uy Tín PartyMode</strong>.
            </p>
          </div>
        ) : (
          <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Chính Sách Trừ Pin Uy Tín (-{penalty.penaltyPoints}%)</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              {penalty.reason}
            </p>
          </div>
        )}

        {/* Chọn lý do hủy */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Lý do bạn muốn hủy ca:
          </label>
          <div className="space-y-1.5">
            {REASONS.map((r, idx) => (
              <label
                key={idx}
                className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                  selectedReason === r
                    ? "bg-purple-950/40 border-purple-600 text-white font-medium"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="cancel_reason"
                  checked={selectedReason === r}
                  onChange={() => setSelectedReason(r)}
                  className="accent-purple-500 w-3.5 h-3.5"
                />
                <span>{r}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Nút thao tác */}
        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            Giữ lại ca làm
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
          >
            Xác nhận Hủy ca
          </button>
        </div>
      </div>
    </div>
  );
}
