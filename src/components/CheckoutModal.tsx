"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  BatteryCharging,
  Star,
  QrCode,
  ArrowRight,
  Wallet,
} from "lucide-react";
import { Shift } from "../domain/types";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift | null;
  onConfirmCheckout: (shiftId: string, earnedAmount: number) => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  shift,
  onConfirmCheckout,
}: CheckoutModalProps) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("Chủ quán thân thiện, môi trường làm việc rất chuyên nghiệp!");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen || !shift) return null;

  const totalEarned = shift.total_budget + (shift.is_sos ? shift.sos_bonus_amount || 0 : 0);

  const handleCheckoutSubmit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      onConfirmCheckout(shift.id, totalEarned);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4.5 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-snug">
                Hoàn Thành Ca & Ký Nhận Escrow
              </h3>
              <p className="text-[11px] text-emerald-100/90 font-medium">
                Giải ngân thù lao tức thì qua VietQR PayOS
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {!isDone ? (
            <>
              {/* Tóm tắt ca làm */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center space-y-1">
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {shift.employer_name}
                </span>
                <h4 className="font-extrabold text-slate-800 text-sm mt-1">
                  {shift.title}
                </h4>
                <p className="text-xs text-slate-500">
                  Thời lượng: {shift.duration_hours} giờ • {shift.shift_start} - {shift.shift_end}
                </p>

                <div className="pt-3 mt-2 border-t border-slate-200 flex items-center justify-around">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Lương cơ bản</span>
                    <span className="text-xs font-bold text-slate-700">
                      {shift.total_budget.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  {shift.is_sos && (
                    <div>
                      <span className="text-[10px] text-rose-500 font-bold block">Thưởng SOS</span>
                      <span className="text-xs font-black text-rose-600">
                        +{(shift.sos_bonus_amount || 0).toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold block">Tổng nhận</span>
                    <span className="text-sm font-black text-emerald-600">
                      {totalEarned.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Lợi ích PartyMode Trust Battery */}
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-emerald-950 block">
                    PartyMode: Tăng +2% Pin Uy Tín
                  </span>
                  <span className="text-emerald-700 text-[11px]">
                    Hoàn thành đúng giờ, không bùng ca giúp bạn luôn được ưu tiên nhận các ca SOS thù lao cao nhất.
                  </span>
                </div>
              </div>

              {/* Đánh giá chủ cơ sở */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Đánh giá chủ cơ sở & quán làm việc:
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Để lại nhận xét nhanh về ca làm..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Nút xác nhận giải ngân */}
              <button
                onClick={handleCheckoutSubmit}
                disabled={isProcessing}
                className="w-full py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-75"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang giải ngân Escrow qua VietQR...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    <span>Xác Nhận Nhận Lương {totalEarned.toLocaleString("vi-VN")} đ</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* TRẠNG THÁI HOÀN TẤT THÀNH CÔNG */
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900">
                  Giải Ngân Thành Công!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Số tiền <strong className="text-emerald-600 font-bold">{totalEarned.toLocaleString("vi-VN")} đ</strong> đã được cộng vào Ví Thu Nhập tức thì của bạn.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã giao dịch Escrow:</span>
                  <span className="font-mono font-bold text-slate-700">ESC-9976-PAY</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phương thức:</span>
                  <span className="font-bold text-indigo-600">VietQR NAPAS 247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thời gian xử lý:</span>
                  <span className="font-bold text-emerald-600">0.8 giây (Tức thì)</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-black text-white transition-all shadow"
              >
                Đóng & Xem Ví Cá Nhân
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
