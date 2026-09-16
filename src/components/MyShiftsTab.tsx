"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  CheckCircle,
  Shield,
  QrCode,
  CheckCircle2,
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
  const [timerSeconds, setTimerSeconds] = useState<number>(3672); // 1h 01m 12s

  // Live timer for active shift
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
    <div className="p-4 space-y-3.5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Ca Làm Của Tôi</h2>
          <p className="text-xs text-slate-400">
            Theo dõi tiến độ, check-in GPS và nhận thù lao Escrow
          </p>
        </div>
        <span className="text-xs font-mono font-medium bg-slate-900 text-slate-300 border border-slate-800 px-2.5 py-0.5 rounded-md">
          {appliedShifts.length} ca
        </span>
      </div>

      {/* Escrow Guarantee Banner (Minimal & Trustworthy) */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-xs">
          <span className="font-semibold text-white block">Bảo chứng ký quỹ Escrow:</span>
          <span className="text-slate-400 text-[11px]">
            Tiền công đã được chủ cơ sở nạp ký quỹ. Hoàn thành ca là nhận tiền tức thì qua VietQR.
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
        <button
          onClick={() => setFilter("ALL")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filter === "ALL"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Tất cả ({appliedShifts.length})
        </button>
        <button
          onClick={() => setFilter("APPLIED")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filter === "APPLIED"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Chờ làm
        </button>
        <button
          onClick={() => setFilter("IN_PROGRESS")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filter === "IN_PROGRESS"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Đang làm
        </button>
        <button
          onClick={() => setFilter("COMPLETED")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filter === "COMPLETED"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Đã xong
        </button>
      </div>

      {/* Shifts List */}
      {filteredShifts.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-semibold text-slate-300">Chưa có ca làm việc nào</h4>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
            Vào tab Khám phá để chọn ca làm phù hợp với quỹ giờ của bạn.
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
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-flat"
              >
                {/* Status Bar */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block">
                      {shift.employer_name}
                    </span>
                    <h3 className="font-bold text-white text-sm mt-0.5">
                      {shift.title}
                    </h3>
                  </div>

                  {status === "APPLIED" && (
                    <span className="text-[10px] font-medium text-amber-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" /> Sẵn sàng bắt đầu
                    </span>
                  )}
                  {status === "IN_PROGRESS" && (
                    <span className="text-[10px] font-medium text-purple-300 bg-purple-950/70 border border-purple-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                      Đang làm việc
                    </span>
                  )}
                  {status === "COMPLETED" && (
                    <span className="text-[10px] font-medium text-emerald-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Đã hoàn thành
                    </span>
                  )}
                </div>

                {/* Thời gian & Địa điểm */}
                <div className="text-xs text-slate-300 space-y-1 bg-slate-950 border border-slate-800/80 p-2.5 rounded-lg">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      Hôm nay • {shift.shift_start} - {shift.shift_end} ({shift.duration_hours}h)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{shift.location_address}</span>
                  </div>
                </div>

                {/* Khi đang làm việc: Live Timer */}
                {status === "IN_PROGRESS" && (
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          Thời gian làm thực tế:
                        </span>
                        <span className="text-sm font-bold font-mono text-white">
                          {formatTimer(timerSeconds)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md font-mono">
                      Escrow Bảo Đảm
                    </span>
                  </div>
                )}

                {/* Footer lương và các nút tương tác */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Lương ca</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {shift.total_budget.toLocaleString("vi-VN")} đ
                    </span>
                    {shift.is_sos && (
                      <span className="text-[10px] font-medium text-rose-400 ml-1">
                        (+{(shift.sos_bonus_amount || 0).toLocaleString("vi-VN")}đ SOS)
                      </span>
                    )}
                  </div>

                  {/* Nút hành động */}
                  <div className="flex items-center gap-2">
                    {status === "APPLIED" && (
                      <button
                        onClick={() => onStartCheckin(shift)}
                        className="text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Check-in GPS / QR</span>
                      </button>
                    )}

                    {status === "IN_PROGRESS" && (
                      <button
                        onClick={() => onStartCheckout(shift)}
                        className="text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Ký Nhận & Rút Lương</span>
                      </button>
                    )}

                    {status === "COMPLETED" && (
                      <span className="text-xs font-medium text-emerald-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã giải ngân
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
