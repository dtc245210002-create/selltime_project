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
import { calculateCompletionReward, getActiveVenuePin, verifyCheckinPin } from "../domain/trust-battery";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift | null;
  onConfirmCheckout: (shift: Shift, earnedAmount: number, rating?: number) => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  shift,
  onConfirmCheckout,
}: CheckoutModalProps) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("Chủ quán thân thiện, môi trường làm việc rất chuyên nghiệp!");
  const [checkoutPin, setCheckoutPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen || !shift) return null;

  const baseWage = shift.hourly_wage * shift.duration_hours;
  const sosBonus = shift.is_sos ? (shift.sos_bonus_amount || 0) : 0;
  const totalEarned = baseWage + sosBonus;
  const completionReward = calculateCompletionReward(Boolean(shift.is_sos), rating);

  const handleCheckoutSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPin = checkoutPin.trim();
    if (!cleanPin) {
      setPinError("Vui lòng nhập mã PIN quầy để hoàn tất ca làm và kích hoạt giải ngân.");
      return;
    }

    if (!verifyCheckinPin(cleanPin)) {
      setPinError(`Mã PIN "${cleanPin}" không khớp với mã quầy hôm nay (${getActiveVenuePin()}). Vui lòng hỏi quản lý thu ngân.`);
      return;
    }

    setPinError(null);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      onConfirmCheckout(shift, totalEarned, rating);
    }, 1200);
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
                Checkout DEMO & Cộng Ví Mẫu
              </h3>
              <p className="text-xs text-slate-400">
                Mô phỏng hoàn thành ca; không chuyển tiền hoặc xác nhận công thật
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
                      {baseWage.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  {shift.is_sos && (
                    <div>
                      <span className="text-[10px] text-rose-400 font-bold block uppercase tracking-wider">Thưởng SOS</span>
                      <span className="text-xs font-mono font-bold text-rose-400">
                        +{sosBonus.toLocaleString("vi-VN")} đ
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
                    Được cộng +{completionReward.rewardPoints}% Pin Uy Tín Sinh Viên 🔋
                  </span>
                  <span className="text-slate-400 text-[11px] leading-relaxed">
                    Hoàn thành ca tốt và đúng hẹn giúp bạn luôn được ưu tiên nhận các ca thưởng nóng cao nhất!
                  </span>
                </div>
              </div>

              {/* Đánh giá chủ cơ sở */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 block">
                  Cảm nhận của bạn về buổi làm việc tại quán:
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

              {/* BẮT BUỘC: MÃ PIN QUẦY XÁC NHẬN KHI CHECK-OUT */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Mã PIN Quầy Xác Nhận Checkout (4 số):
                  </label>
                  <span className="text-[11px] font-mono text-purple-400 font-semibold">
                    Hôm nay: {getActiveVenuePin()}
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  value={checkoutPin}
                  onChange={(e) => {
                    setCheckoutPin(e.target.value);
                    setPinError(null);
                  }}
                  placeholder="Nhập 4 số PIN của quán"
                  className="w-full text-center text-lg tracking-[0.4em] font-mono font-bold py-2 border border-slate-700 rounded-lg focus:border-emerald-500 focus:outline-none bg-slate-900 text-white"
                />
                {pinError && (
                  <p className="text-xs text-rose-400 font-medium text-center">
                    {pinError}
                  </p>
                )}
                <p className="text-[11px] text-slate-400 text-center">
                  Nhân viên hoặc quản lý cơ sở sẽ cung cấp mã PIN này khi bạn bàn giao ca làm việc.
                </p>
              </div>

              {/* Nút xác nhận giải ngân */}
              <button
                type="button"
                onClick={() => handleCheckoutSubmit()}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-colors active:scale-98 disabled:opacity-50 shadow-md shadow-emerald-950/40"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang giải ngân Escrow tức thì 3s...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    <span>Xác Nhận Checkout & Giải Ngân {totalEarned.toLocaleString("vi-VN")} đ</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* TRẠNG THÁI HOÀN TẤT THÀNH CÔNG */
            <div className="text-center py-5 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  🎉 Giải Ngân Escrow Thành Công (2.8s)
                </span>
                <h4 className="text-2xl font-black text-white font-mono">
                  +{totalEarned.toLocaleString("vi-VN")} đ
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                  Số tiền đã tự động trừ từ quỹ ký quỹ tạm giữ và cộng trực tiếp vào <strong className="text-emerald-400">Ví Tiền Sinh Viên</strong>.
                </p>
              </div>

              <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã ca làm:</span>
                  <span className="font-mono font-bold text-slate-200">#ST-{shift.id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kênh giải ngân:</span>
                  <span className="font-bold text-purple-400">VietQR Escrow Napas 24/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trạng thái quỹ:</span>
                  <span className="font-mono font-bold text-emerald-400">ĐÃ GIẢI NGÂN (RELEASED)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pin Uy Tín:</span>
                  <span className="font-bold text-emerald-400 font-mono">+{completionReward.rewardPoints}% (PartyMode)</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-md font-semibold text-xs bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-sm"
              >
                Xem Ví DEMO
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
