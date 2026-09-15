"use client";

import React, { useState } from "react";
import {
  User,
  ShieldCheck,
  BatteryCharging,
  GraduationCap,
  MapPin,
  Clock,
  Sparkles,
  Plus,
  CheckCircle2,
  Wallet,
  Building2,
  QrCode,
  ArrowDownToLine,
  Check,
  CreditCard,
} from "lucide-react";
import { CandidateProfile, User as UserType } from "../domain/types";

interface ProfileTabProps {
  user: UserType;
  profile: CandidateProfile;
  walletBalance?: number;
  onWithdrawFunds?: (amount: number) => void;
}

const VIETNAM_BANKS = [
  { code: "MB", name: "MB Bank (Quân Đội)" },
  { code: "VCB", name: "Vietcombank" },
  { code: "TCB", name: "Techcombank" },
  { code: "BIDV", name: "BIDV" },
  { code: "ICB", name: "VietinBank" },
  { code: "VPB", name: "VPBank" },
  { code: "ACB", name: "ACB Á Châu" },
  { code: "TPB", name: "TPBank" },
];

export function ProfileTab({
  user,
  profile,
  walletBalance = 350000,
  onWithdrawFunds,
}: ProfileTabProps) {
  const [balance, setBalance] = useState(walletBalance);
  const [bankCode, setBankCode] = useState("MB");
  const [accountNumber, setAccountNumber] = useState("0987654321");
  const [accountName, setAccountName] = useState("NGUYEN DUC HUY");
  const [isSaved, setIsSaved] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const daysOfWeek = [
    { label: "T2", active: true },
    { label: "T3", active: true },
    { label: "T4", active: true },
    { label: "T5", active: true },
    { label: "T6", active: true },
    { label: "T7", active: false },
    { label: "CN", active: false },
  ];

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleWithdraw = () => {
    if (balance <= 0) return;
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      if (onWithdrawFunds) {
        onWithdrawFunds(balance);
      }
      setBalance(0);
      setTimeout(() => setWithdrawSuccess(false), 4000);
    }, 1500);
  };

  // Link ảnh VietQR tạo tự động theo tài khoản ngân hàng của sinh viên
  const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=0&addInfo=SellTime%20Luong&accountName=${encodeURIComponent(
    accountName
  )}`;

  return (
    <div className="p-4 space-y-4">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3">
          <img
            src={user.avatar_url}
            alt={user.full_name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
          />
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold text-slate-900">
                {user.full_name}
              </h2>
              {user.is_kyc_verified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Đã eKYC CCCD
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
              {profile.university}
            </p>

            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              {profile.location_address}
            </p>
          </div>
        </div>

        {/* PartyMode Trust Battery Card */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
              <BatteryCharging className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-950 block">
                PartyMode: Pin Uy Tín (Trust Battery)
              </span>
              <span className="text-[10px] text-emerald-700">
                Chưa từng bùng ca • Ưu tiên nhận thông báo SOS
              </span>
            </div>
          </div>
          <span className="text-base font-black text-emerald-600">
            {profile.trust_battery}%
          </span>
        </div>
      </div>

      {/* VÍ THU NHẬP TỨC THÌ (INSTANT ESCROW WALLET) */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white rounded-3xl p-4.5 shadow-lg space-y-3 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
          <Wallet className="w-36 h-36" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs font-bold text-indigo-200">
              Ví Thu Nhập Tức Thì (Escrow Balance)
            </span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
            Tự động giải ngân
          </span>
        </div>

        <div>
          <span className="text-2xl font-black tracking-tight">
            {balance.toLocaleString("vi-VN")} đ
          </span>
          <p className="text-[11px] text-indigo-200/80 mt-0.5">
            Tiền công từ các ca làm đã hoàn tất và được ký quỹ Escrow bảo đảm
          </p>
        </div>

        {withdrawSuccess ? (
          <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Đã gửi lệnh rút tiền về tài khoản {bankCode} ({accountNumber}) qua NAPAS 247!
            </span>
          </div>
        ) : (
          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing || balance <= 0}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isWithdrawing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý chuyển khoản NAPAS 24/7...</span>
              </>
            ) : (
              <>
                <ArrowDownToLine className="w-4 h-4" />
                <span>Rút Tiền Về Ngân Hàng Ngay Lập Tức</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* THIẾT LẬP TÀI KHOẢN NGÂN HÀNG & VIETQR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Tài Khoản Nhận Lương & VietQR
            </h3>
          </div>
          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-100">
            NAPAS 247 Chuẩn Quốc Gia
          </span>
        </div>

        <form onSubmit={handleSaveBank} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Ngân hàng thụ hưởng:
              </label>
              <select
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {VIETNAM_BANKS.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Số tài khoản nhận:
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Tên chủ tài khoản (Không dấu):
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value.toUpperCase())}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="submit"
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Đã lưu thông tin</span>
                </>
              ) : (
                <span>Lưu Tài Khoản Nhận Lương</span>
              )}
            </button>

            <span className="text-[11px] text-slate-400">
              Nhận tiền ngay sau khi kết ca
            </span>
          </div>
        </form>

        {/* Xem trước VietQR cá nhân */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-3 bg-slate-50/80 p-3 rounded-xl">
          <img
            src={qrUrl}
            alt="Mã VietQR cá nhân"
            className="w-20 h-20 rounded-xl border border-slate-200 bg-white object-contain shadow-xs shrink-0"
          />
          <div className="text-xs space-y-0.5">
            <span className="font-extrabold text-slate-800 block">
              Mã VietQR Cá Nhân Của Bạn
            </span>
            <p className="text-[11px] text-slate-500">
              Chủ quán hoặc hệ thống Escrow có thể quét mã này để bắn tiền lương trực tiếp vào tài khoản{" "}
              <strong className="text-indigo-600">{bankCode} - {accountNumber}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Availability Slots Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Khung Giờ Rảnh Cố Định
            </h3>
          </div>
          <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-semibold">
            Tối (18h - 22h)
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Các ngày bạn sẵn sàng bán giờ làm việc trong tuần:
        </p>

        <div className="flex justify-between gap-1.5">
          {daysOfWeek.map((day, idx) => (
            <div
              key={idx}
              className={`flex-1 py-2 rounded-xl text-center text-xs font-bold transition-colors ${
                day.active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {day.label}
            </div>
          ))}
        </div>
      </div>

      {/* Verified Skills */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Kỹ Năng Đã Xác Thực
            </h3>
          </div>
          <button className="text-xs text-indigo-600 flex items-center gap-1 font-semibold hover:underline">
            <Plus className="w-3 h-3" /> Thêm
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {profile.skills.map((skill, idx) => (
            <span
              key={idx}
              className="text-xs font-medium bg-slate-100 text-slate-700 px-3 py-1 rounded-full flex items-center gap-1 border border-slate-200"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Salary Expectation */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-800 block">
            Mức thù lao sàn kỳ vọng
          </span>
          <span className="text-[11px] text-slate-400">
            Tự động lọc các ca có mức chi trả phù hợp
          </span>
        </div>
        <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl">
          {profile.hourly_rate_min.toLocaleString("vi-VN")} đ/h
        </span>
      </div>
    </div>
  );
}
