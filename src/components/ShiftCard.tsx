"use client";

import React, { useState } from "react";
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Building2,
  Bot,
  Loader2,
} from "lucide-react";
import { ShiftWithMatch } from "../domain/types";

interface ShiftCardProps {
  shiftWithMatch: ShiftWithMatch;
  onApply: (shiftId: string) => void;
  isApplied: boolean;
}

export function ShiftCard({
  shiftWithMatch,
  onApply,
  isApplied,
}: ShiftCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showAiGap, setShowAiGap] = useState(false);
  const [aiGapData, setAiGapData] = useState<any>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const { match } = shiftWithMatch;

  const handleFetchAiGap = async () => {
    if (aiGapData) {
      setShowAiGap(!showAiGap);
      return;
    }
    setIsLoadingAi(true);
    setShowAiGap(true);
    try {
      const res = await fetch("/api/ai/gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateSkills: ["Phục vụ bàn", "Pha chế cơ bản", "Thu ngân POS"],
          shiftTitle: shiftWithMatch.title,
          requiredSkills: shiftWithMatch.required_skills,
        }),
      });
      const data = await res.json();
      setAiGapData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Cấu hình màu badge theo FR-7
  const badgeStyles = {
    green: {
      bg: "bg-emerald-500",
      lightBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      ring: "ring-emerald-500/20",
    },
    blue: {
      bg: "bg-blue-500",
      lightBg: "bg-blue-50 text-blue-700 border-blue-200",
      ring: "ring-blue-500/20",
    },
    yellow: {
      bg: "bg-amber-500",
      lightBg: "bg-amber-50 text-amber-700 border-amber-200",
      ring: "ring-amber-500/20",
    },
    gray: {
      bg: "bg-slate-400",
      lightBg: "bg-slate-50 text-slate-600 border-slate-200",
      ring: "ring-slate-400/20",
    },
  }[match.badge_color];

  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow-sm border transition-all duration-200 ${
        shiftWithMatch.is_sos
          ? "border-rose-300 ring-1 ring-rose-200 bg-gradient-to-b from-rose-50/30 to-white"
          : "border-slate-200/80 hover:border-indigo-300 hover:shadow-md"
      }`}
    >
      {/* Header Row: Employer & Matching Score */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          {shiftWithMatch.employer_avatar ? (
            <img
              src={shiftWithMatch.employer_avatar}
              alt={shiftWithMatch.employer_name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              <Building2 className="w-5 h-5" />
            </div>
          )}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              {shiftWithMatch.employer_name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              {shiftWithMatch.is_sos && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-rose-600 text-white animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> Tuyển Gấp
                </span>
              )}
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {shiftWithMatch.work_type === "PART_TIME"
                  ? "Bán thời gian"
                  : "Gig / Dự án"}
              </span>
            </div>
          </div>
        </div>

        {/* Circular Matching Score Badge */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl border transition-transform active:scale-95 ${badgeStyles.lightBg}`}
        >
          <div className="flex items-center gap-0.5 font-black text-sm">
            <Sparkles className="w-3 h-3 inline" />
            <span>{match.total_score}%</span>
          </div>
          <span className="text-[9px] font-medium">{match.badge_label}</span>
        </button>
      </div>

      {/* Job Title */}
      <h3 className="font-bold text-slate-900 text-[15px] leading-snug mb-2">
        {shiftWithMatch.title}
      </h3>

      {/* Meta Info: Time, Duration & Distance */}
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-xl">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">
            {shiftWithMatch.shift_start} - {shiftWithMatch.shift_end} (
            {shiftWithMatch.duration_hours} tiếng)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Cách bạn {match.distance_km} km</span>
        </div>
      </div>

      {/* Wage & Total Pay */}
      <div className="flex items-center justify-between py-1 mb-3">
        <div>
          <span className="text-[11px] text-slate-400 block">Mức thù lao:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-indigo-600">
              {shiftWithMatch.hourly_wage.toLocaleString("vi-VN")} đ
            </span>
            <span className="text-xs text-slate-500 font-medium">/ giờ</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Tổng thu nhập ca:</span>
          <span className="text-sm font-bold text-emerald-700">
            {shiftWithMatch.total_budget.toLocaleString("vi-VN")} đ
          </span>
        </div>
      </div>

      {/* Matching Breakdown Expandable Details */}
      {showBreakdown && (
        <div className="bg-indigo-50/60 border border-indigo-100/80 rounded-xl p-3 mb-3 text-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex justify-between font-bold text-indigo-950 pb-1 border-b border-indigo-200/50">
            <span>Chi tiết độ tương thích Matching:</span>
            <span className="text-indigo-600">{match.total_score}/100</span>
          </div>

          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>⏱️ Trùng khớp thời gian (35%):</span>
                <span className="font-semibold">{match.time_score}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${match.time_score}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>📍 Khoảng cách địa lý (25%):</span>
                <span className="font-semibold">{match.location_score}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${match.location_score}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>🎯 Kỹ năng phù hợp (25%):</span>
                <span className="font-semibold">{match.skill_score}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${match.skill_score}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>💰 Mức lương kỳ vọng (15%):</span>
                <span className="font-semibold">{match.salary_score}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${match.salary_score}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Gap Analysis Expandable Box */}
      {showAiGap && (
        <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3 mb-3 text-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-1 border-b border-purple-200/60 font-bold text-purple-950">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              AI Phân Tích Độ Phù Hợp & Lỗ Hổng:
            </span>
            {isLoadingAi ? (
              <span className="text-[10px] text-purple-600 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Đang hỏi Gemini...
              </span>
            ) : (
              <span className="text-purple-700 font-extrabold">{aiGapData?.verdict || "Khá phù hợp"}</span>
            )}
          </div>

          {isLoadingAi ? (
            <p className="text-[11px] text-purple-600 italic">Gemini 1.5 Flash đang đọc yêu cầu ca làm...</p>
          ) : (
            <div className="space-y-1.5 text-[11px] text-slate-700">
              <p className="leading-relaxed">{aiGapData?.ai_explanation}</p>
              {aiGapData?.gap_warning && (
                <div className="bg-white/80 p-2 rounded-lg border border-purple-200 text-purple-900 font-medium flex items-start gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                  <span>{aiGapData.gap_warning}</span>
                </div>
              )}
              {aiGapData?.preparation_tip && (
                <p className="text-emerald-700 font-semibold text-[10px]">
                  💡 Mẹo chuẩn bị: {aiGapData.preparation_tip}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Action Button: One-Tap Apply */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-0.5 py-2 px-1.5"
          title="Xem điểm số 4 biến"
        >
          <span>Điểm</span>
          {showBreakdown ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          onClick={handleFetchAiGap}
          className="text-xs text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl px-2.5 py-2 font-bold flex items-center gap-1 transition-all"
          title="Hỏi AI Gemini về ca làm này"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Nhận xét</span>
        </button>

        <button
          onClick={() => onApply(shiftWithMatch.id)}
          disabled={isApplied}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 ${
            isApplied
              ? "bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default"
              : shiftWithMatch.is_sos
              ? "bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md shadow-rose-500/20 hover:opacity-95"
              : "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
          }`}
        >
          {isApplied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã ứng tuyển (Chờ quán duyệt)</span>
            </>
          ) : (
            <>
              <span>Ứng tuyển 1 chạm</span>
              <span className="text-[10px] opacity-80">• Nhận tiền ngay</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
