"use client";

import React, { useState } from "react";
import {
  Building2,
  ShieldCheck,
  MapPin,
  Wallet,
  Star,
  QrCode,
  KeyRound,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { EmployerProfile, User as UserType } from "../domain/types";
import { PaymentQrModal } from "./PaymentQrModal";

interface EmployerProfileTabProps {
  user: UserType;
  profile: EmployerProfile;
}

export function EmployerProfileTab({ user, profile }: EmployerProfileTabProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [escrowBalance, setEscrowBalance] = useState(1250000);
  const [venuePin, setVenuePin] = useState("8866");
  const [isCopiedPin, setIsCopiedPin] = useState(false);

  const handleCopyPin = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(venuePin);
      setIsCopiedPin(true);
      setTimeout(() => setIsCopiedPin(false), 2000);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Header Profile Quán */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-indigo-400 shrink-0">
            <Building2 className="w-8 h-8 text-indigo-300" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold text-slate-900">
                {profile.company_name}
              </h2>
              {profile.verified_badge && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.2 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Đã eKYC
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              Chủ cơ sở: <strong className="text-slate-800">{user.full_name}</strong>
            </p>

            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{profile.address}</span>
            </p>
          </div>
        </div>

        {/* Chỉ số uy tín F&B */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-base font-black text-indigo-600 block">28</span>
            <span className="text-[10px] text-slate-500">Ca đã hoàn tất</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-base font-black text-emerald-600 block">100%</span>
            <span className="text-[10px] text-slate-500">Thanh toán đúng hẹn</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-base font-black text-amber-500 block flex items-center justify-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9
            </span>
            <span className="text-[10px] text-slate-500">Đánh giá SV (50+)</span>
          </div>
        </div>
      </div>

      {/* VÍ KÝ QUỸ ESCROW PAYOS CỦA QUÁN */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-lg space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-200 block">
                Số Dư Ký Quỹ Escrow PayOS
              </span>
              <span className="text-[10px] text-slate-400">
                Tiền bảo đảm giải ngân tức thì cho sinh viên
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
            NAPAS 24/7
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-2xl font-black text-white">
              {escrowBalance.toLocaleString("vi-VN")} đ
            </span>
            <p className="text-[11px] text-indigo-200/70 mt-0.5">
              Đủ bảo đảm cho ~8 ca làm việc tiếp theo
            </p>
          </div>

          <button
            onClick={() => setShowQrModal(true)}
            className="py-2 px-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>Nạp Quỹ VietQR</span>
          </button>
        </div>
      </div>

      {/* MÃ PIN CHECK-IN TẠI QUẦY THU NGÂN */}
      <div className="bg-white rounded-3xl p-4.5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Mã PIN Check-in Tại Quầy (Dự phòng)
              </h3>
              <p className="text-[10px] text-slate-500">
                Cung cấp cho sinh viên khi mạng chập chờn hoặc mất GPS
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
            Đang hoạt động
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">Mã PIN hôm nay:</span>
            <span className="text-xl font-mono font-black tracking-widest text-slate-900">
              {venuePin}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyPin}
            className="text-xs font-bold text-indigo-600 bg-white hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
          >
            {isCopiedPin ? "Đã sao chép!" : "Sao chép PIN"}
          </button>
        </div>
      </div>

      {/* Modal nạp tiền VietQR */}
      <PaymentQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title="Nạp Quỹ Escrow The Cuppa"
        amount={500000}
        content="NAP QUY ESCROW THE CUPPA"
        onPaymentSuccess={() => {
          setEscrowBalance((prev) => prev + 500000);
        }}
      />
    </div>
  );
}
