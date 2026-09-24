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
  onUpdateProfile,
  onUpdateUser,
}: ProfileTabProps & {
  onUpdateProfile?: (updatedProfile: CandidateProfile) => void;
  onUpdateUser?: (updatedUser: Partial<UserType>) => void;
}) {
  const [balance, setBalance] = useState(walletBalance);
  const [bankCode, setBankCode] = useState("MB");
  const [accountNumber, setAccountNumber] = useState("0987654321");
  const [accountName, setAccountName] = useState(user.full_name.toUpperCase());
  const [isSaved, setIsSaved] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // State chỉnh sửa thông tin cá nhân
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState(user.full_name);
  const [editUniversity, setEditUniversity] = useState(profile.university);
  const [editAddress, setEditAddress] = useState(profile.location_address);
  const [editBio, setEditBio] = useState(profile.bio || "");
  const [editRate, setEditRate] = useState(profile.hourly_rate_min);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // State lịch rảnh trong tuần
  const [scheduleDays, setScheduleDays] = useState([
    { label: "T2", active: true },
    { label: "T3", active: true },
    { label: "T4", active: true },
    { label: "T5", active: true },
    { label: "T6", active: true },
    { label: "T7", active: false },
    { label: "CN", active: false },
  ]);
  const [schedulePeriod, setSchedulePeriod] = useState<string>("Tối (18h - 22h)");

  // State thêm kỹ năng
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const SUGGESTED_SKILLS = [
    "Pha chế cà phê máy",
    "Làm bánh & Dessert",
    "Tiếng Anh giao tiếp",
    "Dọn dẹp & Tạp vụ",
    "Kiểm kho & Xuất nhập",
    "Bảo vệ & Giữ xe",
  ];

  const handleToggleDay = (idx: number) => {
    setScheduleDays((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, active: !d.active } : d))
    );
  };

  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({ full_name: editFullName.trim() || user.full_name });
    }
    if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        university: editUniversity.trim() || profile.university,
        location_address: editAddress.trim() || profile.location_address,
        bio: editBio.trim(),
        hourly_rate_min: Number(editRate) || profile.hourly_rate_min,
      });
    }
    setAccountName((editFullName.trim() || user.full_name).toUpperCase());
    setIsEditingProfile(false);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed || profile.skills.includes(trimmed)) return;
    const updatedSkills = [...profile.skills, trimmed];
    if (onUpdateProfile) {
      onUpdateProfile({ ...profile, skills: updatedSkills });
    }
    setCustomSkillInput("");
    setIsAddingSkill(false);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = profile.skills.filter((s) => s !== skillToRemove);
    if (onUpdateProfile) {
      onUpdateProfile({ ...profile, skills: updatedSkills });
    }
  };

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
    <div className="space-y-4 w-full">
      {/* Thông báo cập nhật hồ sơ thành công */}
      {profileSaveSuccess && (
        <div className="bg-emerald-950/70 border border-emerald-800/80 rounded-lg p-2.5 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Hồ sơ sinh viên của bạn đã được cập nhật thành công!</span>
        </div>
      )}

      {/* 1. Profile Header & Chỉnh Sửa */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-flat space-y-3">
        {!isEditingProfile ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
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

              {/* Nút chỉnh sửa */}
              <button
                type="button"
                onClick={() => {
                  setEditFullName(user.full_name);
                  setEditUniversity(profile.university);
                  setEditAddress(profile.location_address);
                  setEditBio(profile.bio || "");
                  setEditRate(profile.hourly_rate_min);
                  setIsEditingProfile(true);
                }}
                className="shrink-0 text-xs font-semibold text-purple-400 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/50 px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
              >
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            </div>

            {profile.bio && (
              <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-md border border-slate-800/80 italic leading-relaxed">
                &ldquo;{profile.bio}&rdquo;
              </p>
            )}
          </>
        ) : (
          /* FORM CHỈNH SỬA HỒ SƠ SINH VIÊN */
          <form onSubmit={handleSaveProfileSubmit} className="space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Chỉnh Sửa Thông Tin Sinh Viên
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Hủy
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Họ và tên sinh viên:
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-slate-700 bg-slate-950 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Trường Đại học / Học viện:
                </label>
                <input
                  type="text"
                  required
                  value={editUniversity}
                  onChange={(e) => setEditUniversity(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-slate-700 bg-slate-950 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Khu vực / Ký túc xá / Nơi ở:
                </label>
                <input
                  type="text"
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-slate-700 bg-slate-950 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Mức lương sàn kỳ vọng (đ/h):
                </label>
                <input
                  type="number"
                  step={1000}
                  min={15000}
                  value={editRate}
                  onChange={(e) => setEditRate(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-md border border-slate-700 bg-slate-950 text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Giới thiệu bản thân & kinh nghiệm:
              </label>
              <textarea
                rows={2}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Ví dụ: Sinh viên năm 3, nhiệt tình, có trách nhiệm, tìm ca làm tối..."
                className="w-full text-xs p-2 rounded-md border border-slate-700 bg-slate-950 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="text-xs py-1.5 px-3 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="text-xs font-semibold py-1.5 px-4 rounded-md bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Lưu Thay Đổi</span>
              </button>
            </div>
          </form>
        )}

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

      {/* 2. Weekly Availability Schedule (Interactive Click to Toggle) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-flat space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-semibold text-white">
              Lịch Rảnh Cố Định Trong Tuần
            </h3>
          </div>
          <select
            value={schedulePeriod}
            onChange={(e) => setSchedulePeriod(e.target.value)}
            className="text-[10px] text-purple-300 bg-purple-950/70 border border-purple-800/60 px-2 py-0.5 rounded-md font-medium focus:outline-none"
          >
            <option value="Sáng (8h - 12h)" className="bg-slate-900 text-white">Sáng (8h - 12h)</option>
            <option value="Chiều (13h - 17h)" className="bg-slate-900 text-white">Chiều (13h - 17h)</option>
            <option value="Tối (18h - 22h)" className="bg-slate-900 text-white">Tối (18h - 22h)</option>
            <option value="Đêm (22h - 02h)" className="bg-slate-900 text-white">Đêm (22h - 02h)</option>
          </select>
        </div>

        <p className="text-[11px] text-slate-500">
          Chạm vào các ngày trong tuần để bật/tắt lịch rảnh đi làm của bạn:
        </p>

        <div className="flex justify-between gap-1.5 pt-0.5">
          {scheduleDays.map((day, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleToggleDay(idx)}
              className={`flex-1 py-1.5 rounded-md text-center text-xs font-mono font-bold transition-all ${
                day.active
                  ? "bg-purple-600 text-white shadow-xs scale-105"
                  : "bg-slate-950 text-slate-500 border border-slate-800 hover:text-slate-300"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Verified Skills (Add & Remove in real time) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-flat space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-semibold text-white">
              Kỹ Năng Đã Xác Thực ({profile.skills.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingSkill(!isAddingSkill)}
            className="text-xs text-purple-400 flex items-center gap-1 hover:text-purple-300 font-medium bg-purple-950/40 border border-purple-800/40 px-2 py-0.5 rounded-md"
          >
            <Plus className="w-3 h-3" /> {isAddingSkill ? "Đóng" : "Thêm"}
          </button>
        </div>

        {/* Khung thêm kỹ năng mới */}
        {isAddingSkill && (
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 animate-in fade-in">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập tên kỹ năng (vd: Pha chế trà sữa, Thu ngân...)"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSkill(customSkillInput)}
                className="flex-1 text-xs p-2 rounded-md border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(customSkillInput)}
                disabled={!customSkillInput.trim()}
                className="text-xs font-semibold px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-md transition-colors"
              >
                Thêm
              </button>
            </div>

            {/* Gợi ý kỹ năng phổ biến */}
            <div>
              <span className="text-[10px] text-slate-500 block mb-1">Gợi ý nhanh:</span>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_SKILLS.filter((s) => !profile.skills.includes(s)).map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    className="text-[11px] text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1"
                  >
                    <span>+</span> {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {profile.skills.map((skill, idx) => (
            <span
              key={idx}
              className="text-xs font-medium bg-slate-950 text-slate-300 pl-2.5 pr-1.5 py-1 rounded-md flex items-center gap-1.5 border border-slate-800 group"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="w-3.5 h-3.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 flex items-center justify-center text-[10px] transition-colors ml-0.5"
                title="Xóa kỹ năng này"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 4. Salary Floor Expectation (Quick Edit) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-flat flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-white block">
            Mức lương sàn kỳ vọng
          </span>
          <span className="text-[11px] text-slate-500">
            Tự động lọc ca làm có thù lao phù hợp
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold font-mono text-emerald-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md">
            {profile.hourly_rate_min.toLocaleString("vi-VN")} đ/h
          </span>
          <button
            type="button"
            onClick={() => {
              const newRateStr = prompt("Nhập mức lương sàn mới (đ/h):", profile.hourly_rate_min.toString());
              if (newRateStr && !isNaN(Number(newRateStr))) {
                const newRate = Number(newRateStr);
                if (onUpdateProfile) onUpdateProfile({ ...profile, hourly_rate_min: newRate });
              }
            }}
            className="text-[11px] text-purple-400 hover:text-purple-300 underline"
          >
            Đổi
          </button>
        </div>
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
