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

  return (
    <div
      className={`bg-slate-900 border rounded-xl p-4 transition-all duration-150 flex flex-col justify-between overflow-hidden ${
        shiftWithMatch.is_sos
          ? "border-rose-700/70 bg-slate-900/95"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      <div>
        {/* Cover Photo Header with Employer Logo & SOS Badge */}
        {shiftWithMatch.cover_image ? (
          <div className="relative h-28 -mx-4 -mt-4 mb-3 overflow-hidden group">
            <img
              src={shiftWithMatch.cover_image}
              alt={shiftWithMatch.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

            {/* Badges Overlay */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-xs px-2 py-0.5 rounded-full border border-slate-700/60">
                {shiftWithMatch.employer_avatar ? (
                  <img
                    src={shiftWithMatch.employer_avatar}
                    alt={shiftWithMatch.employer_name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-slate-300" />
                )}
                <span className="text-[11px] font-medium text-slate-200 truncate max-w-[130px]">
                  {shiftWithMatch.employer_name}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {shiftWithMatch.is_sos && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                    <AlertTriangle className="w-3 h-3" /> SOS GẤP
                  </span>
                )}
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white shadow-xs flex items-center gap-1 transition-colors"
                  title="Bấm để xem phân tích AI"
                >
                  <span>{match.total_score}% Hợp</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showBreakdown ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Fallback Header when no cover image */
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {shiftWithMatch.employer_avatar ? (
                <img
                  src={shiftWithMatch.employer_avatar}
                  alt={shiftWithMatch.employer_name}
                  className="w-8 h-8 rounded-md object-cover border border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-xs font-medium text-slate-400 truncate block">
                  {shiftWithMatch.employer_name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {shiftWithMatch.is_sos && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-rose-950/70 border border-rose-800/80 text-rose-300">
                  <AlertTriangle className="w-3 h-3 text-rose-400" /> SOS Tuyển Gấp
                </span>
              )}
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-purple-950/70 text-purple-300 border border-purple-800/60 hover:bg-purple-900/60 transition-colors"
                title="Độ phù hợp Matching"
              >
                {match.total_score}%
              </button>
            </div>
          </div>
        )}

        {/* Prominent Job Title */}
        <h3 className="font-bold text-white text-[15px] leading-snug mb-2">
          {shiftWithMatch.title}
        </h3>

        {/* Working Hours & Distance (Scannable Metadata Row) */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 mb-2 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-1.5 min-w-0">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-mono">
              {shiftWithMatch.shift_start} - {shiftWithMatch.shift_end} ({shiftWithMatch.duration_hours}h)
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{match.distance_km} km</span>
          </div>
        </div>

        {/* Friendly Human Tags (Điểm cộng ca làm) */}
        {shiftWithMatch.friendly_tags && shiftWithMatch.friendly_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {shiftWithMatch.friendly_tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800/90"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Store Perks Row */}
        {shiftWithMatch.store_perks && shiftWithMatch.store_perks.length > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-2.5 overflow-x-auto scrollbar-none">
            {shiftWithMatch.store_perks.map((perk, idx) => (
              <span key={idx} className="shrink-0 bg-slate-950/40 px-1.5 py-0.5 rounded">
                {perk}
              </span>
            ))}
          </div>
        )}

        {/* Wage & Total Pay */}
        <div className="flex items-baseline justify-between mb-3 px-0.5">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Thù lao theo giờ
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold font-mono text-emerald-400">
                {shiftWithMatch.hourly_wage.toLocaleString("vi-VN")} đ
              </span>
              <span className="text-xs text-slate-500">/h</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Tổng tiền nhận
            </span>
            <span className="text-xs font-semibold font-mono text-slate-200">
              {shiftWithMatch.total_budget.toLocaleString("vi-VN")} đ
            </span>
          </div>
        </div>

        {/* Matching Breakdown Expandable Details */}
        {showBreakdown && (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 mb-3 text-xs space-y-2 animate-in fade-in duration-150">
            <div className="flex justify-between font-semibold text-slate-300 pb-1 border-b border-slate-800">
              <span>Chi tiết điểm so khớp thông minh:</span>
              <span className="font-mono text-purple-400">{match.total_score}/100</span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Khung giờ rảnh (35%):</span>
                <span className="font-mono text-slate-200">{match.time_score}%</span>
              </div>
              <div className="flex justify-between">
                <span>Khoảng cách di chuyển (25%):</span>
                <span className="font-mono text-slate-200">{match.location_score}%</span>
              </div>
              <div className="flex justify-between">
                <span>Kỹ năng phù hợp (25%):</span>
                <span className="font-mono text-slate-200">{match.skill_score}%</span>
              </div>
              <div className="flex justify-between">
                <span>Mức thù lao kỳ vọng (15%):</span>
                <span className="font-mono text-slate-200">{match.salary_score}%</span>
              </div>
            </div>
          </div>
        )}

        {/* AI Gap Analysis Expandable Box */}
        {showAiGap && (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 mb-3 text-xs space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 font-semibold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Gợi ý từ Trợ lý AI:
              </span>
              {isLoadingAi ? (
                <span className="text-[10px] text-purple-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Đang xem xét ca...
                </span>
              ) : (
                <span className="text-purple-300 text-[11px]">{aiGapData?.verdict || "Rất phù hợp"}</span>
              )}
            </div>

            {isLoadingAi ? (
              <p className="text-[11px] text-slate-500 italic">Gemini đang phân tích độ phù hợp...</p>
            ) : (
              <div className="space-y-1 text-[11px] text-slate-400 leading-relaxed">
                <p>{aiGapData?.ai_explanation}</p>
                {aiGapData?.preparation_tip && (
                  <p className="text-emerald-400 font-medium">
                    Gợi ý: {aiGapData.preparation_tip}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons: AI Feedback toggle & Apply CTA */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleFetchAiGap}
          className="text-xs text-slate-400 hover:text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md px-2.5 py-2.5 font-medium flex items-center gap-1 transition-colors shrink-0"
          title="Xem nhận xét AI"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Gợi ý AI</span>
        </button>

        <button
          onClick={() => onApply(shiftWithMatch.id)}
          disabled={isApplied}
          className={`flex-1 py-2.5 px-3 rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors ${
            isApplied
              ? "bg-slate-800 text-emerald-400 border border-slate-700 cursor-default"
              : shiftWithMatch.is_sos
              ? "bg-rose-600 hover:bg-rose-500 text-white shadow-sm"
              : "bg-purple-600 hover:bg-purple-500 text-white shadow-sm"
          }`}
        >
          {isApplied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Đã ứng tuyển</span>
            </>
          ) : (
            <>
              <span>Ứng tuyển ngay</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
