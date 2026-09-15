"use client";

import React, { useState } from "react";
import { Clock, Navigation, Zap, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { CandidateFilterCriteria, ShiftPeriod } from "../domain/types";

interface TimeSliderWidgetProps {
  criteria: CandidateFilterCriteria;
  onChange: (updated: CandidateFilterCriteria) => void;
  matchCount: number;
}

export function TimeSliderWidget({
  criteria,
  onChange,
  matchCount,
}: TimeSliderWidgetProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const periods: { id: ShiftPeriod; label: string; hours: string; icon: string }[] = [
    { id: "MORNING", label: "Sáng", hours: "06h - 12h", icon: "🌅" },
    { id: "AFTERNOON", label: "Chiều", hours: "12h - 18h", icon: "☀️" },
    { id: "EVENING", label: "Tối", hours: "18h - 22h", icon: "🌙" },
    { id: "NIGHT", label: "Đêm", hours: "22h - 06h", icon: "🌌" },
  ];

  const togglePeriod = (p: ShiftPeriod) => {
    const exists = criteria.selected_periods.includes(p);
    let updated: ShiftPeriod[];
    if (exists) {
      if (criteria.selected_periods.length === 1) return; // Giữ ít nhất 1 khung giờ
      updated = criteria.selected_periods.filter((item) => item !== p);
    } else {
      updated = [...criteria.selected_periods, p];
    }
    onChange({ ...criteria, selected_periods: updated });
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-5 rounded-b-[28px] shadow-lg relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="absolute -right-10 -top-10 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

      {/* Header Catchphrase */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-indigo-200 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md">
            ⚡ Time-First Search UX
          </span>
          <h2 className="text-xl font-bold mt-1 text-white tracking-tight">
            Hôm nay bạn muốn bán bao nhiêu giờ?
          </h2>
        </div>
      </div>

      {/* Main Big Hour Display & Slider */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-4">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm text-indigo-100 font-medium">Quỹ thời gian rảnh:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-amber-300">
              {criteria.hours_to_sell}
            </span>
            <span className="text-sm font-semibold text-white">tiếng</span>
          </div>
        </div>

        {/* Time Slider */}
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={criteria.hours_to_sell}
          onChange={(e) =>
            onChange({ ...criteria, hours_to_sell: parseFloat(e.target.value) })
          }
          className="w-full h-2.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />

        <div className="flex justify-between text-[11px] text-indigo-200 mt-1 font-mono">
          <span>1h</span>
          <span>4h (Tiêu chuẩn)</span>
          <span>8h</span>
          <span>10h+</span>
        </div>
      </div>

      {/* Quick Shift Periods Selector */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-indigo-100 mb-2 block">
          Chọn khung giờ khả dụng:
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {periods.map((p) => {
            const isSelected = criteria.selected_periods.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePeriod(p.id)}
                className={`py-2 px-1 rounded-xl text-center transition-all duration-200 border flex flex-col items-center justify-center ${
                  isSelected
                    ? "bg-white text-indigo-950 font-bold border-white shadow-md scale-[1.02]"
                    : "bg-white/10 text-white/80 border-white/10 hover:bg-white/20"
                }`}
              >
                <span className="text-base">{p.icon}</span>
                <span className="text-xs font-semibold mt-0.5">{p.label}</span>
                <span className="text-[9px] opacity-75">{p.hours}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Filter Collapse Toggle */}
      <div className="flex justify-between items-center pt-2 border-t border-white/10 text-xs">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-indigo-200 hover:text-white transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Bán kính & Lương sàn</span>
          {showAdvanced ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        <div className="flex items-center gap-1 text-emerald-300 font-medium">
          <Zap className="w-3.5 h-3.5" />
          <span>{matchCount} ca sẵn sàng</span>
        </div>
      </div>

      {/* Advanced Filter Content */}
      {showAdvanced && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-3 bg-black/20 p-3 rounded-xl">
          {/* Radius Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-indigo-200 flex items-center gap-1">
                <Navigation className="w-3 h-3" /> Bán kính tối đa:
              </span>
              <span className="font-bold text-amber-300">
                {criteria.max_distance_km} km
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={criteria.max_distance_km}
              onChange={(e) =>
                onChange({
                  ...criteria,
                  max_distance_km: parseFloat(e.target.value),
                })
              }
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Hourly Wage Floor */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-indigo-200 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Lương sàn kỳ vọng:
              </span>
              <span className="font-bold text-amber-300">
                {criteria.min_hourly_rate.toLocaleString("vi-VN")} đ/h
              </span>
            </div>
            <input
              type="range"
              min="20000"
              max="60000"
              step="2000"
              value={criteria.min_hourly_rate}
              onChange={(e) =>
                onChange({
                  ...criteria,
                  min_hourly_rate: parseInt(e.target.value, 10),
                })
              }
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
