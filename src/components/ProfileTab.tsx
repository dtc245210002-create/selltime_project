"use client";

import React from "react";
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
} from "lucide-react";
import { CandidateProfile, User as UserType } from "../domain/types";

interface ProfileTabProps {
  user: UserType;
  profile: CandidateProfile;
}

export function ProfileTab({ user, profile }: ProfileTabProps) {
  const daysOfWeek = [
    { label: "T2", active: true },
    { label: "T3", active: true },
    { label: "T4", active: true },
    { label: "T5", active: true },
    { label: "T6", active: true },
    { label: "T7", active: false },
    { label: "CN", active: false },
  ];

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
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Đã eKYC
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
