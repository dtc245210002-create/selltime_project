"use client";

import React from "react";
import { Clock, MapPin, CheckCircle, Shield, AlertCircle } from "lucide-react";
import { Shift } from "../domain/types";

interface MyShiftsTabProps {
  appliedShifts: Shift[];
}

export function MyShiftsTab({ appliedShifts }: MyShiftsTabProps) {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Ca Làm Của Tôi</h2>
          <p className="text-xs text-slate-500">
            Theo dõi tiến độ, check-in GPS và nhận lương Escrow
          </p>
        </div>
        <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
          {appliedShifts.length} ca đã đăng ký
        </span>
      </div>

      {/* Escrow Guarantee Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="text-xs">
          <span className="font-bold block">Bảo vệ lương tức thì với Escrow:</span>
          <span className="opacity-90">
            Tiền công đã được chủ cơ sở ký quỹ tạm giữ. Hoàn thành ca là nhận tiền trong 3 giây.
          </span>
        </div>
      </div>

      {/* Shifts List */}
      {appliedShifts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-2">
            <Clock className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-700">Chưa có ca làm việc nào</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
            Hãy sang tab Khám phá và bấm &quot;Ứng tuyển 1 chạm&quot; vào ca làm phù hợp với quỹ giờ của bạn nhé!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {appliedShifts.map((shift) => (
            <div
              key={shift.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {shift.employer_name}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">
                    {shift.title}
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Chờ xác nhận
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    Hôm nay • {shift.shift_start} - {shift.shift_end} ({shift.duration_hours}h)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="truncate">{shift.location_address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-slate-400">Lương ca:</span>
                  <span className="text-sm font-black text-emerald-600 ml-1">
                    {shift.total_budget.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                  Xem lộ trình bản đồ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
