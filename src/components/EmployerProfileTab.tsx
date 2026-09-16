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
  const [venuePin] = useState("8866");
  const [isCopiedPin, setIsCopiedPin] = useState(false);

  const handleCopyPin = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(venuePin);
      setIsCopiedPin(true);
      setTimeout(() => setIsCopiedPin(false), 2000);
    }
  };

  return (
    <div className="p-4 space-y-3.5 max-w-2xl mx-auto">
      {/* Header Profile Quán */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-flat space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-purple-400 shrink-0">
            <Building2 className="w-7 h-7" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white truncate">
                {profile.company_name}
              </h2>
              {profile.verified_badge && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Đã eKYC
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-0.5">
              Đại diện: <strong className="text-slate-200">{user.full_name}</strong>
            </p>

            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{profile.address}</span>
            </p>
          </div>
        </div>

        {/* Chỉ số uy tín */}
        <div className="pt-2.5 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg">
            <span className="text-base font-bold font-mono text-white block">28</span>
            <span className="text-[10px] text-slate-500">Ca hoàn tất</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg">
            <span className="text-base font-bold font-mono text-emerald-400 block">100%</span>
            <span className="text-[10px] text-slate-500">Đúng hạn</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg">
            <span className="text-base font-bold font-mono text-amber-400 block flex items-center justify-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9
            </span>
            <span className="text-[10px] text-slate-500">Đánh giá (50+)</span>
          </div>
        </div>
      </div>

      {/* VÍ KÝ QUỸ ESCROW PAYOS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-flat space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white">
              Số Dư Ký Quỹ Escrow
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md font-mono">
            NAPAS 24/7
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-2xl font-bold font-mono text-white">
              {escrowBalance.toLocaleString("vi-VN")} đ
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Bảo đảm giải ngân cho ~8 ca tiếp theo
            </p>
          </div>

          <button
            onClick={() => setShowQrModal(true)}
            className="py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-md font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Nạp Quỹ VietQR</span>
          </button>
        </div>
      </div>

      {/* MÃ PIN CHECK-IN TẠI QUẦY */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-flat space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-semibold text-white">
              Mã PIN Điểm Danh Dự Phòng
            </h3>
          </div>
          <span className="text-[10px] text-slate-500">Cung cấp khi mất GPS</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 block">Mã PIN hôm nay:</span>
            <span className="text-xl font-mono font-bold tracking-widest text-purple-400">
              {venuePin}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyPin}
            className="text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-850 px-3 py-1.5 rounded-md border border-slate-800 transition-colors"
          >
            {isCopiedPin ? "Đã sao chép" : "Sao chép PIN"}
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
