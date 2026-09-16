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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-md rounded-xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white leading-snug">
                Hoàn Thành Ca & Ký Nhận Escrow
              </h3>
              <p className="text-xs text-slate-400">
                Giải ngân thù lao tức thì qua VietQR PayOS
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
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
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-center space-y-1.5">
                <span className="text-xs font-semibold text-purple-400 bg-purple-950/40 border border-purple-800/40 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {shift.employer_name}
                </span>
                <h4 className="font-bold text-white text-sm mt-1">
                  {shift.title}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  Thời lượng: {shift.duration_hours} giờ • {shift.shift_start} - {shift.shift_end}
                </p>

                <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-around">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Lương cơ bản</span>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {shift.total_budget.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  {shift.is_sos && (
                    <div>
                      <span className="text-[10px] text-rose-400 font-bold block uppercase tracking-wider">Thưởng SOS</span>
                      <span className="text-xs font-mono font-bold text-rose-400">
                        +{(shift.sos_bonus_amount || 0).toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">Tổng nhận</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">
                      {totalEarned.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Lợi ích PartyMode Trust Battery */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">
                    PartyMode: Tăng +2% Pin Uy Tín
                  </span>
                  <span className="text-slate-400 text-[11px] leading-relaxed">
                    Hoàn thành đúng giờ, không bùng ca giúp bạn luôn được ưu tiên nhận các ca SOS thù lao cao nhất.
                  </span>
                </div>
              </div>

              {/* Đánh giá chủ cơ sở */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 block">
                  Đánh giá chủ cơ sở & quán làm việc:
                </label>
                <div className="flex justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-700"
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
                  className="w-full text-xs p-2.5 rounded-md border border-slate-700 bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Nút xác nhận giải ngân */}
              <button
                onClick={handleCheckoutSubmit}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-md font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-colors active:scale-98 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
            <div className="text-center py-5 space-y-4 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white">
                  Giải Ngân Thành Công!
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Số tiền <strong className="text-emerald-400 font-mono font-bold">{totalEarned.toLocaleString("vi-VN")} đ</strong> đã được cộng vào Ví Thu Nhập tức thì của bạn.
                </p>
              </div>

              <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã giao dịch Escrow:</span>
                  <span className="font-mono font-bold text-slate-200">ESC-9976-PAY</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phương thức:</span>
                  <span className="font-medium text-purple-400">VietQR NAPAS 247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian xử lý:</span>
                  <span className="font-mono font-medium text-emerald-400">0.8 giây (Tức thì)</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-md font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
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
