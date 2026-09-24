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
  onUpdateProfile?: (updatedProfile: EmployerProfile) => void;
  onUpdateUser?: (updatedUser: Partial<UserType>) => void;
}

export function EmployerProfileTab({
  user,
  profile,
  onUpdateProfile,
  onUpdateUser,
}: EmployerProfileTabProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [escrowBalance, setEscrowBalance] = useState(1250000);
  const [venuePin, setVenuePin] = useState("8866");
  const [isCopiedPin, setIsCopiedPin] = useState(false);

  // State chỉnh sửa thông tin quán
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editCompanyName, setEditCompanyName] = useState(profile.company_name);
  const [editRepName, setEditRepName] = useState(user.full_name);
  const [editAddress, setEditAddress] = useState(profile.address);
  const [editPhone, setEditPhone] = useState(user.phone || "0912345678");
  const [editBusinessType, setEditBusinessType] = useState(profile.business_type || "FNB");
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // State đổi mã PIN điểm danh
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [tempPin, setTempPin] = useState(venuePin);
  const [pinSaveSuccess, setPinSaveSuccess] = useState(false);

  const handleCopyPin = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(venuePin);
      setIsCopiedPin(true);
      setTimeout(() => setIsCopiedPin(false), 2000);
    }
  };

  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({
        full_name: editRepName.trim() || user.full_name,
        phone: editPhone.trim() || user.phone,
      });
    }
    if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        company_name: editCompanyName.trim() || profile.company_name,
        address: editAddress.trim() || profile.address,
        business_type: editBusinessType as any,
      });
    }
    setIsEditingProfile(false);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempPin.trim().length === 4) {
      setVenuePin(tempPin.trim());
      setIsEditingPin(false);
      setPinSaveSuccess(true);
      setTimeout(() => setPinSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Thông báo cập nhật thành công */}
      {profileSaveSuccess && (
        <div className="bg-emerald-950/70 border border-emerald-800/80 rounded-lg p-2.5 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Thông tin cơ sở & chủ quán đã được cập nhật thành công!</span>
        </div>
      )}

      {/* Header Profile Quán */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-flat space-y-3">
        {!isEditingProfile ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
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
                    Đại diện: <strong className="text-slate-200">{user.full_name}</strong> • Hotline: <span className="font-mono text-slate-300">{user.phone || "0912345678"}</span>
                  </p>

                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{profile.address}</span>
                  </p>
                </div>
              </div>

              {/* Nút chỉnh sửa */}
              <button
                type="button"
                onClick={() => {
                  setEditCompanyName(profile.company_name);
                  setEditRepName(user.full_name);
                  setEditAddress(profile.address);
                  setEditPhone(user.phone || "0912345678");
                  setEditBusinessType(profile.business_type || "FNB");
                  setIsEditingProfile(true);
                }}
                className="shrink-0 text-xs font-semibold text-purple-400 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/50 px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
              >
                <span>Chỉnh sửa quán</span>
              </button>
            </div>
          </>
        ) : (
          /* FORM CHỈNH SỬA THÔNG TIN QUÁN */
          <form onSubmit={handleSaveProfileSubmit} className="space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Chỉnh Sửa Thông Tin Cơ Sở Tuyển Dụng
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
                  Tên quán / Doanh nghiệp:
                </label>
                <input
                  type="text"
                  required
                  value={editCompanyName}
                  onChange={(e) => setEditCompanyName(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-slate-700 bg-slate-950 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Họ và tên người đại diện:
                </label>
                <input
                  type="text"
                  required
                  value={editRepName}
                  onChange={(e) => setEditRepName(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-slate-700 bg-slate-950 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Địa chỉ cơ sở (Hiển thị cho ứng viên):
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
                  Số điện thoại hotline:
                </label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-slate-700 bg-slate-950 text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Lĩnh vực kinh doanh:
              </label>
              <select
                value={editBusinessType}
                onChange={(e) => setEditBusinessType(e.target.value as any)}
                className="w-full text-xs p-2 rounded-md border border-slate-700 bg-slate-950 text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="FNB" className="bg-slate-900 text-white">F&B (Nhà hàng, Quán Cafe, Trà sữa)</option>
                <option value="RETAIL" className="bg-slate-900 text-white">Bán lẻ & Cửa hàng tiện lợi</option>
                <option value="LOGISTICS" className="bg-slate-900 text-white">Kho vận & Giao hàng</option>
                <option value="OTHER" className="bg-slate-900 text-white">Khác</option>
              </select>
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
                <span>Lưu Thay Đổi</span>
              </button>
            </div>
          </form>
        )}

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

      {/* MÃ PIN CHECK-IN TẠI QUẦY & ĐỔI PIN */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-flat space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-semibold text-white">
              Mã PIN Điểm Danh Dự Phòng
            </h3>
          </div>
          <span className="text-[10px] text-slate-500">Cung cấp khi ứng viên mất sóng GPS</span>
        </div>

        {pinSaveSuccess && (
          <div className="bg-emerald-950/70 border border-emerald-800/80 rounded-md p-2 text-xs text-emerald-300">
            ✓ Đã cập nhật mã PIN điểm danh quầy mới thành công!
          </div>
        )}

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2">
          {!isEditingPin ? (
            <>
              <div>
                <span className="text-[10px] text-slate-500 block">Mã PIN hôm nay:</span>
                <span className="text-xl font-mono font-bold tracking-widest text-purple-400">
                  {venuePin}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTempPin(venuePin);
                    setIsEditingPin(true);
                  }}
                  className="text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-800 transition-colors"
                >
                  Đổi PIN
                </button>
                <button
                  type="button"
                  onClick={handleCopyPin}
                  className="text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md border border-slate-700 transition-colors"
                >
                  {isCopiedPin ? "Đã sao chép" : "Sao chép PIN"}
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSavePin} className="flex items-center gap-2 w-full">
              <input
                type="text"
                maxLength={4}
                required
                value={tempPin}
                onChange={(e) => setTempPin(e.target.value)}
                placeholder="4 số PIN"
                className="w-28 text-center text-sm font-mono font-bold py-1.5 px-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="text-xs font-semibold px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-md transition-colors"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={() => setIsEditingPin(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1.5"
              >
                Hủy
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Modal nạp tiền VietQR */}
      <PaymentQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title={`Nạp Quỹ Escrow ${profile.company_name}`}
        amount={500000}
        content={`NAP QUY ESCROW ${profile.company_name.toUpperCase().slice(0, 15)}`}
        onPaymentSuccess={() => {
          setEscrowBalance((prev) => prev + 500000);
        }}
      />
    </div>
  );
}
