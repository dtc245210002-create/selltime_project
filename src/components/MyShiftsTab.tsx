"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  CheckCircle,
  Shield,
  QrCode,
  CheckCircle2,
  Navigation,
  Play,
  RotateCcw,
} from "lucide-react";
import { Shift } from "../domain/types";

export type ShiftAttendanceStatus = "APPLIED" | "IN_PROGRESS" | "COMPLETED";

interface MyShiftsTabProps {
  appliedShifts: Shift[];
  shiftStatuses: Record<string, ShiftAttendanceStatus>;
  onStartCheckin: (shift: Shift) => void;
  onStartCheckout: (shift: Shift) => void;
}

export function MyShiftsTab({
  appliedShifts,
  shiftStatuses,
  onStartCheckin,
  onStartCheckout,
}: MyShiftsTabProps) {
  const [filter, setFilter] = useState<"ALL" | ShiftAttendanceStatus>("ALL");
  const [timerSeconds, setTimerSeconds] = useState<number>(3672); // Mô phỏng đã làm 1h 01m 12s

  // Bộ đếm thời gian thực khi có ca đang làm việc
  useEffect(() => {
    const hasInProgress = Object.values(shiftStatuses).some(
      (s) => s === "IN_PROGRESS"
    );
    if (!hasInProgress) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [shiftStatuses]);

  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const filteredShifts = appliedShifts.filter((shift) => {
    const status = shiftStatuses[shift.id] || "APPLIED";
    if (filter === "ALL") return true;
    return status === filter;
  });

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
            Tiền công đã được chủ cơ sở ký quỹ. Hoàn thành ca là nhận tiền trong 3 giây qua VietQR PayOS.
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setFilter("ALL")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            filter === "ALL"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Tất cả ({appliedShifts.length})
        </button>
        <button
          onClick={() => setFilter("APPLIED")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            filter === "APPLIED"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Chờ làm
        </button>
        <button
          onClick={() => setFilter("IN_PROGRESS")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            filter === "IN_PROGRESS"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Đang làm
        </button>
        <button
          onClick={() => setFilter("COMPLETED")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            filter === "COMPLETED"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Đã xong
        </button>
      </div>

      {/* Shifts List */}
      {filteredShifts.length === 0 ? (
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
          {filteredShifts.map((shift) => {
            const status: ShiftAttendanceStatus =
              shiftStatuses[shift.id] || "APPLIED";

            return (
              <div
                key={shift.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 relative overflow-hidden"
              >
                {/* Status Bar */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {shift.employer_name}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">
                      {shift.title}
                    </h3>
                  </div>

                  {status === "APPLIED" && (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" /> Sẵn sàng bắt đầu
                    </span>
                  )}
                  {status === "IN_PROGRESS" && (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                      Đang làm việc
                    </span>
                  )}
                  {status === "COMPLETED" && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã hoàn thành
                    </span>
                  )}
                </div>

                {/* Thông tin thời gian & địa điểm */}
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

                {/* Khi đang làm việc: Hiển thị Live Timer */}
                {status === "IN_PROGRESS" && (
                  <div className="bg-indigo-50/70 border border-indigo-200/70 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                        <Clock className="w-4 h-4 animate-spin" />
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-700 font-bold block">
                          Thời gian làm việc trực tiếp:
                        </span>
                        <span className="text-sm font-black font-mono text-indigo-950">
                          {formatTimer(timerSeconds)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      Escrow Đang Giữ
                    </span>
                  </div>
                )}

                {/* Footer lương và các nút tương tác */}
                <div className="flex flex-wrap items-center justify-between pt-1 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400">Lương ca:</span>
                    <span className="text-sm font-black text-emerald-600 ml-1">
                      {shift.total_budget.toLocaleString("vi-VN")} đ
                    </span>
                    {shift.is_sos && (
                      <span className="text-[10px] font-bold text-rose-600 ml-1.5 bg-rose-50 px-1.5 py-0.2 rounded">
                        +{(shift.sos_bonus_amount || 0).toLocaleString("vi-VN")}đ SOS
                      </span>
                    )}
                  </div>

                  {/* Nút hành động tương ứng với trạng thái */}
                  <div className="flex items-center gap-2">
                    {status === "APPLIED" && (
                      <button
                        onClick={() => onStartCheckin(shift)}
                        className="text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 px-3.5 py-1.5 rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Check-in GPS & QR</span>
                      </button>
                    )}

                    {status === "IN_PROGRESS" && (
                      <button
                        onClick={() => onStartCheckout(shift)}
                        className="text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-3.5 py-1.5 rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Ký Nhận & Rút Lương Escrow</span>
                      </button>
                    )}

                    {status === "COMPLETED" && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Đã giải ngân VietQR
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
