"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  BatteryCharging,
  GraduationCap,
  MapPin,
  Clock,
  Sparkles,
  Plus,
  CheckCircle2,
  Wallet,
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
    }, 1200);
  };

  const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=0&addInfo=SellTime%20Luong&accountName=${encodeURIComponent(
    accountName
  )}`;

  return (
    <div className="p-4 space-y-3.5 max-w-2xl mx-auto">
      {/* 1. Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-flat space-y-3">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar_url}
            alt={user.full_name}
            className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white truncate">
                {user.full_name}
              </h2>
              {user.is_kyc_verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Đã xác thực eKYC
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
              <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{profile.university}</span>
            </p>

            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{profile.location_address}</span>
            </p>
          </div>
        </div>

        {/* PartyMode Trust Battery Row */}
        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-medium">
              Chỉ số uy tín: <strong className="text-emerald-400">{profile.trust_battery}%</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Ưu tiên nhận việc SOS
          </span>
        </div>
      </div>

      {/* 2. Weekly Availability Schedule (Clean & Compact) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-flat space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-semibold text-white">
              Lịch Rảnh Cố Định Trong Tuần
            </h3>
          </div>
          <span className="text-[10px] text-purple-300 bg-purple-950/70 border border-purple-800/60 px-2 py-0.5 rounded-md font-medium">
            Tối (18h - 22h)
          </span>
        </div>

        <div className="flex justify-between gap-1.5 pt-1">
          {daysOfWeek.map((day, idx) => (
            <div
              key={idx}
              className={`flex-1 py-1.5 rounded-md text-center text-xs font-mono font-medium transition-colors ${
                day.active
                  ? "bg-purple-600 text-white"
                  : "bg-slate-950 text-slate-500 border border-slate-800"
              }`}
            >
              {day.label}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Verified Skills (Compact Tags) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-flat space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-semibold text-white">
              Kỹ Năng Đã Xác Thực
            </h3>
          </div>
          <button className="text-xs text-purple-400 flex items-center gap-1 hover:text-purple-300 font-medium">
            <Plus className="w-3 h-3" /> Thêm
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {profile.skills.map((skill, idx) => (
            <span
              key={idx}
              className="text-xs font-medium bg-slate-950 text-slate-300 px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-slate-800"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* 4. Salary Floor Expectation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-flat flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-white block">
            Mức lương sàn kỳ vọng
          </span>
          <span className="text-[11px] text-slate-500">
            Tự động lọc ca làm có thù lao phù hợp
          </span>
        </div>
        <span className="text-sm font-bold font-mono text-emerald-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md">
          {profile.hourly_rate_min.toLocaleString("vi-VN")} đ/h
        </span>
      </div>

      {/* 5. Escrow Wallet & Instant Payout */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-flat space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white">
              Ví Thu Nhập Tức Thì (Escrow)
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md font-mono">
            NAPAS 24/7
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-0.5">
          <div>
            <span className="text-2xl font-bold font-mono text-white">
              {balance.toLocaleString("vi-VN")} đ
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tiền công từ các ca làm đã hoàn tất và được ký quỹ
            </p>
          </div>
        </div>

        {withdrawSuccess ? (
          <div className="bg-slate-950 border border-emerald-800/80 rounded-md p-2.5 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Đã gửi lệnh rút tiền về tài khoản {bankCode} ({accountNumber})!
            </span>
          </div>
        ) : (
          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing || balance <= 0}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isWithdrawing ? (
              <span>Đang xử lý chuyển khoản...</span>
            ) : (
              <>
                <ArrowDownToLine className="w-4 h-4" />
                <span>Rút Tiền Về Ngân Hàng Ngay</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 6. Bank Account & VietQR Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-flat space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-semibold text-white">
              Tài Khoản Ngân Hàng Nhận Lương
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">Tự động nhận sau ca</span>
        </div>

        <form onSubmit={handleSaveBank} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Ngân hàng thụ hưởng:
              </label>
              <select
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-slate-800 bg-slate-950 text-white focus:border-purple-500 focus:outline-none"
              >
                {VIETNAM_BANKS.map((b) => (
                  <option key={b.code} value={b.code} className="bg-slate-900 text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Số tài khoản:
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-slate-800 bg-slate-950 text-white font-mono focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Tên chủ tài khoản:
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value.toUpperCase())}
              className="w-full text-xs p-2 rounded-md border border-slate-800 bg-slate-950 text-white uppercase focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="submit"
              className="text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã lưu</span>
                </>
              ) : (
                <span>Lưu thông tin</span>
              )}
            </button>

            <span className="text-[11px] text-slate-500">
              Nhận tiền trong 3 giây sau khi checkout
            </span>
          </div>
        </form>

        {/* VietQR Preview */}
        <div className="pt-2.5 border-t border-slate-800 flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg">
          <img
            src={qrUrl}
            alt="Mã VietQR cá nhân"
            className="w-16 h-16 rounded-md border border-slate-800 bg-white object-contain shrink-0"
          />
          <div className="text-xs space-y-0.5 min-w-0">
            <span className="font-semibold text-white block">
              Mã VietQR Cá Nhân
            </span>
            <p className="text-[11px] text-slate-400 truncate">
              Chủ quán hoặc hệ thống Escrow quét để chuyển thù lao vào tài khoản{" "}
              <strong className="text-slate-200">{bankCode} - {accountNumber}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
