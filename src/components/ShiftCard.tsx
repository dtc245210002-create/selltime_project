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
  Coins,
  Wallet,
  Info,
  BadgeCheck,
  Flame,
} from "lucide-react";
import { ShiftWithMatch } from "../domain/types";

interface ShiftCardProps {
  shiftWithMatch: ShiftWithMatch;
  onApply: (shiftId: string) => void;
  isApplied: boolean;
  candidateSkills?: string[];
}

export function ShiftCard({
  shiftWithMatch,
  onApply,
  isApplied,
  candidateSkills,
}: ShiftCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showAiGap, setShowAiGap] = useState(false);
  const [aiGapData, setAiGapData] = useState<any>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { match } = shiftWithMatch;

  const handleFetchAiGap = async () => {
    if (aiGapData) {
      setShowAiGap(!showAiGap);
      return;
    }
    setIsLoadingAi(true);
    setShowAiGap(true);
    try {
      const skillsToSend = candidateSkills && candidateSkills.length > 0
        ? candidateSkills
        : ["Phục vụ bàn", "Pha chế cơ bản", "Thu ngân POS", "Giao tiếp"];

      const res = await fetch("/api/ai/gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateSkills: skillsToSend,
          shiftTitle: shiftWithMatch.title,
          requiredSkills: shiftWithMatch.required_skills || [],
        }),
      });
      const data = await res.json();
      setAiGapData(data);
    } catch (err) {
      console.error(err);
      // Fallback local nếu fetch gặp sự cố
      setAiGapData({
        fit_percentage: match.total_score || 90,
        verdict: "Rất phù hợp",
        ai_explanation: `Bạn có các kỹ năng phù hợp với ca "${shiftWithMatch.title}", đáp ứng tốt yêu cầu công việc.`,
        gap_warning: "Không có lỗ hổng kỹ năng đáng kể.",
        preparation_tip: "Hãy đến sớm 10 phút để nhận việc và kiểm tra định vị GPS điểm danh.",
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div
      className={`bg-slate-900 border rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-xl ${
        shiftWithMatch.is_sos
          ? "border-rose-600/80 bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/20"
          : "border-slate-800 hover:border-slate-700 bg-slate-900"
      }`}
    >
      <div>
        {/* Cover Image & Header Badges */}
        {shiftWithMatch.cover_image && !imgError ? (
          <div className="relative h-28 -mx-4 -mt-4 mb-3.5 overflow-hidden group">
            <img
              src={shiftWithMatch.cover_image}
              alt={shiftWithMatch.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

            {/* Badges Overlay */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/60 shadow-md">
                {shiftWithMatch.employer_avatar ? (
                  <img
                    src={shiftWithMatch.employer_avatar}
                    alt={shiftWithMatch.employer_name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                ) : (
                  <Building2 className="w-4 h-4 text-slate-300" />
                )}
                <span className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[150px]">
                  {shiftWithMatch.employer_name}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {shiftWithMatch.is_sos && (
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-black px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-md animate-pulse">
                    <AlertTriangle className="w-4 h-4" /> SOS GẤP
                  </span>
                )}
                <span className="text-xs sm:text-sm font-black px-2.5 py-1 rounded-full bg-purple-600 text-white shadow-md flex items-center gap-1">
                  <span>{match.total_score}% Hợp</span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Fallback Header when no cover image */
          <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              {shiftWithMatch.employer_avatar ? (
                <img
                  src={shiftWithMatch.employer_avatar}
                  alt={shiftWithMatch.employer_name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-sm sm:text-base font-bold text-slate-200 truncate block">
                  {shiftWithMatch.employer_name}
                </span>
                <span className="text-xs text-slate-400 font-medium">Huy hiệu mẫu (DEMO)</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {shiftWithMatch.is_sos && (
                <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-xs animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" /> SOS GẤP
                </span>
              )}
              <span className="text-xs sm:text-sm font-black px-2.5 py-1 rounded-full bg-purple-600 text-white shadow-xs">
                {match.total_score}% Hợp
              </span>
            </div>
          </div>
        )}

        {/* Tiêu đề công việc chính */}
        <h3 className="font-bold text-white text-base leading-snug mb-2.5 line-clamp-2">
          {shiftWithMatch.title}
        </h3>

        {/* 1. KHUNG CA LÀM VIỆC */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-800/50 flex items-center justify-center shrink-0 text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">
                Ca làm việc
              </span>
              <div className="flex items-baseline gap-1.5 flex-wrap sm:flex-nowrap">
                <span className="text-sm sm:text-base font-bold font-mono text-white whitespace-nowrap">
                  {shiftWithMatch.shift_start} - {shiftWithMatch.shift_end}
                </span>
                <span className="text-xs font-bold text-purple-400 bg-purple-950/80 border border-purple-800/40 px-1.5 py-0.5 rounded">
                  {shiftWithMatch.duration_hours}h
                </span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 pl-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">
              Khoảng cách
            </span>
            <div className="flex items-center justify-end gap-1 text-slate-200 text-xs sm:text-sm font-bold font-mono whitespace-nowrap">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{match.distance_km} km</span>
            </div>
          </div>
        </div>

        {/* 2. KHUNG THÙ LAO & TỔNG TIỀN NHẬN */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-3 mb-2.5 flex items-center justify-between shadow-xs">
          {/* Thù lao theo giờ */}
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-500" /> Thù lao theo giờ
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-500 tracking-tight whitespace-nowrap">
                {shiftWithMatch.hourly_wage.toLocaleString("vi-VN")}
              </span>
              <span className="text-xs font-bold text-emerald-600">đ/h</span>
            </div>
          </div>

          {/* Đường ngăn cách nhẹ */}
          <div className="h-8 w-px bg-slate-800 shrink-0 mx-2" />

          {/* Tổng tiền nhận */}
          <div className="text-right min-w-0">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block flex items-center justify-end gap-1">
              <Wallet className="w-3.5 h-3.5 text-amber-500" /> Tổng tiền nhận
            </span>
            <div className="flex items-baseline justify-end gap-1 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-amber-500 tracking-tight whitespace-nowrap">
                {shiftWithMatch.total_budget.toLocaleString("vi-VN")}
              </span>
              <span className="text-xs font-bold text-amber-600">đ</span>
            </div>
          </div>
        </div>

        {/* Nút bấm Xem chi tiết ca & phân tích */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mb-3 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-sm font-semibold flex items-center justify-between transition-colors"
        >
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            {showDetails ? "Ẩn bớt chi tiết ca" : "Xem chi tiết ca & quyền lợi"}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              showDetails ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* 3. PHẦN THÔNG TIN CHI TIẾT MỞ RỘNG (EXPANDABLE DETAILS) */}
        {showDetails && (
          <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 mb-3 text-sm space-y-3.5 animate-in fade-in duration-200">
            {/* Mô tả công việc */}
            {shiftWithMatch.description && (
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-300 block mb-1">
                  Mô tả công việc:
                </span>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  {shiftWithMatch.description}
                </p>
              </div>
            )}

            {/* Địa chỉ thực tế */}
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-300 block mb-1">
                Địa chỉ làm việc:
              </span>
              <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{shiftWithMatch.location_address}</span>
              </div>
            </div>

            {/* Nhãn thân thiện (Friendly Tags) */}
            {shiftWithMatch.friendly_tags && shiftWithMatch.friendly_tags.length > 0 && (
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-300 block mb-1.5">
                  Điểm nổi bật:
                </span>
                <div className="flex flex-wrap gap-2">
                  {shiftWithMatch.friendly_tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-950/50 text-purple-200 border border-purple-800/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quyền lợi tại cơ sở (Store Perks) */}
            {shiftWithMatch.store_perks && shiftWithMatch.store_perks.length > 0 && (
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-300 block mb-1.5">
                  Quyền lợi ca làm:
                </span>
                <div className="flex flex-wrap gap-2">
                  {shiftWithMatch.store_perks.map((perk, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-950/40 text-emerald-200 border border-emerald-800/40"
                    >
                      {perk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Kỹ năng yêu cầu */}
            {shiftWithMatch.required_skills && shiftWithMatch.required_skills.length > 0 && (
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-300 block mb-1.5">
                  Kỹ năng yêu cầu:
                </span>
                <div className="flex flex-wrap gap-2">
                  {shiftWithMatch.required_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chi tiết điểm so khớp AHP 4 biến */}
            <div className="pt-2.5 border-t border-slate-800/80 space-y-2">
              <div className="flex justify-between font-bold text-slate-200 text-xs sm:text-sm">
                <span>Điểm Matching AHP:</span>
                <span className="font-mono text-purple-400">{match.total_score}/100</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div className="flex justify-between bg-slate-900/80 px-2.5 py-1.5 rounded">
                  <span>Khung giờ (35%):</span>
                  <span className="font-mono text-slate-200">{match.time_score}%</span>
                </div>
                <div className="flex justify-between bg-slate-900/80 px-2.5 py-1.5 rounded">
                  <span>Vị trí (25%):</span>
                  <span className="font-mono text-slate-200">{match.location_score}%</span>
                </div>
                <div className="flex justify-between bg-slate-900/80 px-2.5 py-1.5 rounded">
                  <span>Kỹ năng (25%):</span>
                  <span className="font-mono text-slate-200">{match.skill_score}%</span>
                </div>
                <div className="flex justify-between bg-slate-900/80 px-2.5 py-1.5 rounded">
                  <span>Mức lương (15%):</span>
                  <span className="font-mono text-slate-200">{match.salary_score}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Gap Analysis Expandable Box */}
        {showAiGap && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 mb-3 text-xs sm:text-sm space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-semibold text-slate-200">
              <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Gợi ý từ Trợ lý AI:
              </span>
              {isLoadingAi ? (
                <span className="text-xs text-purple-400 flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang phân tích...
                </span>
              ) : (
                <span className="text-purple-300 text-xs sm:text-sm font-bold">{aiGapData?.verdict || "Rất phù hợp"}</span>
              )}
            </div>

            {isLoadingAi ? (
              <p className="text-xs sm:text-sm text-slate-500 italic">Gemini đang phân tích độ phù hợp với hồ sơ của bạn...</p>
            ) : (
              <div className="space-y-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                <p>{aiGapData?.ai_explanation}</p>
                {aiGapData?.gap_warning && (
                  <p className="text-amber-400 font-medium bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/30">
                    {aiGapData.gap_warning}
                  </p>
                )}
                {aiGapData?.preparation_tip && (
                  <p className="text-emerald-400 font-medium bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/30">
                    💡 <strong>Gợi ý:</strong> {aiGapData.preparation_tip}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons: AI Feedback toggle & Apply CTA */}
      <div className="flex items-center gap-2.5 pt-1.5">
        <button
          onClick={handleFetchAiGap}
          className="text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl px-3.5 py-3 font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
          title="Xem nhận xét AI"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Gợi ý AI</span>
        </button>

        <button
          onClick={() => onApply(shiftWithMatch.id)}
          disabled={isApplied}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
            isApplied
              ? "bg-slate-800 text-emerald-400 border border-slate-700 cursor-default"
              : shiftWithMatch.is_sos
              ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30"
              : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30"
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

