import React, { useState } from "react";
import {
  Clock,
  Navigation,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  X,
  Bot,
} from "lucide-react";
import { CandidateFilterCriteria, ShiftPeriod, WorkType } from "../domain/types";

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
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPromptText, setAiPromptText] = useState("");
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const periods: { id: ShiftPeriod; label: string; hours: string; icon: string }[] = [
    { id: "MORNING", label: "Sáng", hours: "06h - 12h", icon: "🌅" },
    { id: "AFTERNOON", label: "Chiều", hours: "12h - 18h", icon: "☀️" },
    { id: "EVENING", label: "Tối", hours: "18h - 22h", icon: "🌙" },
    { id: "NIGHT", label: "Đêm", hours: "22h - 06h", icon: "🌌" },
  ];

  const workTypeOptions: { id: WorkType | "ALL"; label: string }[] = [
    { id: "ALL", label: "Tất cả" },
    { id: "PART_TIME", label: "Bán thời gian" },
    { id: "GIG", label: "Thời vụ / Gig" },
  ];

  const togglePeriod = (p: ShiftPeriod) => {
    const exists = criteria.selected_periods.includes(p);
    let updated: ShiftPeriod[];
    if (exists) {
      if (criteria.selected_periods.length === 1) return;
      updated = criteria.selected_periods.filter((item) => item !== p);
    } else {
      updated = [...criteria.selected_periods, p];
    }
    onChange({ ...criteria, selected_periods: updated });
  };

  const handleWorkTypeChange = (type: WorkType | "ALL") => {
    if (type === "ALL") {
      onChange({ ...criteria, work_types: [] });
    } else {
      onChange({ ...criteria, work_types: [type] });
    }
  };

  // Trợ lý AI NLP Lọc tự nhiên ("Tôi rảnh tối, biết pha chế...")
  const handleAiFilter = (promptToProcess?: string) => {
    const text = (promptToProcess || aiPromptText).toLowerCase().trim();
    if (!text) return;

    const detectedPeriods: ShiftPeriod[] = [];
    if (text.includes("sáng") || text.includes("morning") || text.includes("trưa")) {
      detectedPeriods.push("MORNING");
    }
    if (text.includes("chiều") || text.includes("afternoon")) {
      detectedPeriods.push("AFTERNOON");
    }
    if (text.includes("tối") || text.includes("evening") || text.includes("đêm")) {
      detectedPeriods.push("EVENING");
    }
    if (text.includes("khuya") || text.includes("đêm muộn")) {
      detectedPeriods.push("NIGHT");
    }

    let keyword = "";
    if (text.includes("pha chế") || text.includes("barista") || text.includes("cà phê") || text.includes("coffee")) {
      keyword = "Pha chế";
    } else if (text.includes("phục vụ") || text.includes("chạy bàn") || text.includes("bàn")) {
      keyword = "Phục vụ";
    } else if (text.includes("bảo vệ") || text.includes("giữ xe")) {
      keyword = "Bảo vệ";
    } else if (text.includes("thu ngân") || text.includes("bán hàng") || text.includes("order")) {
      keyword = "Thu ngân";
    } else if (text.includes("tnut") || text.includes("kỹ thuật công nghiệp")) {
      keyword = "TNUT";
    }

    const updatedPeriods = detectedPeriods.length > 0 ? detectedPeriods : criteria.selected_periods;

    onChange({
      ...criteria,
      selected_periods: updatedPeriods,
      search_keyword: keyword || (text.length <= 25 ? text : ""),
    });

    const periodNames = updatedPeriods.map((p) => {
      if (p === "MORNING") return "Sáng";
      if (p === "AFTERNOON") return "Chiều";
      if (p === "EVENING") return "Tối";
      return "Đêm";
    }).join(", ");

    setAiFeedback(
      `Đã áp dụng: Khung giờ [${periodNames}]${keyword ? ` • Từ khóa [${keyword}]` : ""}`
    );
  };

  // Chế độ chọn: Slider tiêu chuẩn hoặc Tự nhập ca gãy
  const [timeMode, setTimeMode] = useState<"SLIDER" | "SPLIT_SHIFT">("SLIDER");
  const [splitStart, setSplitStart] = useState("11:00");
  const [splitEnd, setSplitEnd] = useState("13:30");

  const splitPresets = [
    { label: "🍜 Ca gãy trưa (11:00 - 13:30)", start: "11:00", end: "13:30", hours: 2.5, periods: ["MORNING", "AFTERNOON"] as ShiftPeriod[] },
    { label: "☕ Ca gãy chiều (14:00 - 16:30)", start: "14:00", end: "16:30", hours: 2.5, periods: ["AFTERNOON"] as ShiftPeriod[] },
    { label: "🌙 Ca gãy tối (17:30 - 20:30)", start: "17:30", end: "20:30", hours: 3.0, periods: ["EVENING"] as ShiftPeriod[] },
    { label: "🌌 Ca gãy khuya (21:30 - 23:30)", start: "21:30", end: "23:30", hours: 2.0, periods: ["NIGHT"] as ShiftPeriod[] },
  ];

  const applyCustomSplit = (start: string, end: string) => {
    setSplitStart(start);
    setSplitEnd(end);
    const [h1, m1] = start.split(":").map(Number);
    const [h2, m2] = end.split(":").map(Number);
    let minutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (minutes <= 0) minutes += 24 * 60;
    const duration = Math.max(0.5, Math.round((minutes / 60) * 10) / 10);

    const detected: ShiftPeriod[] = [];
    if (h1 < 12 || (h1 === 11 && m1 >= 0)) detected.push("MORNING");
    if (h1 >= 12 && h1 < 18) detected.push("AFTERNOON");
    if (h1 >= 17 && h1 < 22) detected.push("EVENING");
    if (h1 >= 21 || h1 < 6) detected.push("NIGHT");

    onChange({
      ...criteria,
      hours_to_sell: duration,
      selected_periods: detected.length > 0 ? detected : ["MORNING", "AFTERNOON"],
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 space-y-3.5 shadow-flat">
      {/* Title & Mode Switcher */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-semibold text-purple-400 tracking-wider">
            Tìm Kiếm Theo Giờ Rảnh
          </span>
          <h2 className="text-base font-bold text-white mt-0.5 tracking-tight">
            Hôm nay bạn muốn bán bao nhiêu giờ?
          </h2>
        </div>

        {/* Tab Toggle: Kéo Giờ vs Ca Gãy */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setTimeMode("SLIDER")}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors ${
              timeMode === "SLIDER"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ⏱️ Kéo Giờ
          </button>
          <button
            type="button"
            onClick={() => {
              setTimeMode("SPLIT_SHIFT");
              applyCustomSplit(splitStart, splitEnd);
            }}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors ${
              timeMode === "SPLIT_SHIFT"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ⚡ Ca Gãy
          </button>
        </div>
      </div>

      {/* Search Input & Work Types */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo chức danh, ca gãy, địa điểm..."
            value={criteria.search_keyword || ""}
            onChange={(e) =>
              onChange({ ...criteria, search_keyword: e.target.value })
            }
            className="w-full bg-slate-950 text-white placeholder-slate-500 text-xs rounded-md pl-9 pr-8 py-2 border border-slate-800 focus:outline-none focus:border-purple-500 transition-colors"
          />
          {criteria.search_keyword && (
            <button
              onClick={() => onChange({ ...criteria, search_keyword: "" })}
              className="absolute right-2.5 p-1 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter controls row */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowAiPrompt(!showAiPrompt)}
            className="flex items-center gap-1 text-[11px] font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span>{showAiPrompt ? "Thu gọn Lọc AI" : "Lọc ngôn ngữ tự nhiên"}</span>
          </button>

          {/* Work type filter pills */}
          <div className="flex items-center gap-1">
            {workTypeOptions.map((opt) => {
              const isSelected =
                (opt.id === "ALL" && (!criteria.work_types || criteria.work_types.length === 0)) ||
                (criteria.work_types && criteria.work_types.includes(opt.id as WorkType));
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleWorkTypeChange(opt.id)}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md border transition-colors ${
                    isSelected
                      ? "bg-slate-800 text-white border-slate-700"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Natural language drawer */}
        {showAiPrompt && (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="VD: Rảnh ca gãy trưa 11h-13h30 gần TNUT..."
                value={aiPromptText}
                onChange={(e) => setAiPromptText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiFilter()}
                className="flex-1 bg-slate-900 text-white placeholder-slate-500 text-xs rounded-md px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => handleAiFilter()}
                className="bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs px-2.5 py-1.5 rounded-md flex items-center gap-1 shrink-0 transition-colors"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Lọc</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-500">Mẫu:</span>
              <button
                type="button"
                onClick={() => {
                  setAiPromptText("Ca gãy trưa, phục vụ gần TNUT");
                  handleAiFilter("Ca gãy trưa, phục vụ gần TNUT");
                }}
                className="text-[10px] bg-slate-900 hover:bg-slate-850 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
              >
                🍜 Ca gãy trưa (11h-13h30)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiPromptText("Rảnh tối, pha chế The Cuppa");
                  handleAiFilter("Rảnh tối, pha chế The Cuppa");
                }}
                className="text-[10px] bg-slate-900 hover:bg-slate-850 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
              >
                🌙 Ca tối • Pha chế
              </button>
            </div>

            {aiFeedback && (
              <p className="text-[10px] text-emerald-400 pt-0.5">
                {aiFeedback}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 1. CHẾ ĐỘ KÉO GIỜ TIÊU CHUẨN */}
      {timeMode === "SLIDER" ? (
        <>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs text-slate-400">Quỹ thời gian rảnh:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-white">
                  {criteria.hours_to_sell}
                </span>
                <span className="text-xs text-slate-400 font-medium">tiếng</span>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={criteria.hours_to_sell}
              onChange={(e) =>
                onChange({ ...criteria, hours_to_sell: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-800 rounded-md appearance-none cursor-pointer accent-purple-500"
            />

            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>1h</span>
              <span>4h (Tiêu chuẩn)</span>
              <span>8h</span>
              <span>10h+</span>
            </div>
          </div>

          {/* Shift Periods Selector */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              Khung giờ khả dụng:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {periods.map((p) => {
                const isSelected = criteria.selected_periods.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePeriod(p.id)}
                    className={`py-2 px-1 rounded-md text-center border transition-colors flex flex-col items-center justify-center ${
                      isSelected
                        ? "bg-purple-600 text-white font-semibold border-purple-500 shadow-sm"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white"
                    }`}
                  >
                    <span className="text-sm">{p.icon}</span>
                    <span className="text-xs font-medium mt-0.5">{p.label}</span>
                    <span className="text-[9px] opacity-75">{p.hours}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* 2. CHẾ ĐỘ TỰ NHẬP CA GÃY LINH HOẠT (SPLIT SHIFT MODE) */
        <div className="space-y-3 bg-slate-950 border border-purple-900/40 rounded-xl p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> Tự nhập khung giờ ca gãy của bạn:
            </span>
            <span className="text-[11px] font-bold font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
              {criteria.hours_to_sell} tiếng rảnh
            </span>
          </div>

          {/* Form nhập thời gian cụ thể */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-slate-400 block mb-1">
                Giờ bắt đầu rảnh:
              </label>
              <input
                type="time"
                value={splitStart}
                onChange={(e) => applyCustomSplit(e.target.value, splitEnd)}
                className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-mono font-bold rounded-lg p-2 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-400 block mb-1">
                Giờ kết thúc rảnh:
              </label>
              <input
                type="time"
                value={splitEnd}
                onChange={(e) => applyCustomSplit(splitStart, e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-mono font-bold rounded-lg p-2 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Presets Ca Gãy */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Chọn nhanh ca gãy phổ biến sinh viên:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {splitPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    applyCustomSplit(preset.start, preset.end);
                  }}
                  className={`text-[11px] text-left p-2 rounded-lg border transition-all ${
                    splitStart === preset.start && splitEnd === preset.end
                      ? "bg-purple-950/80 border-purple-600 text-purple-200 font-bold shadow-xs"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white"
                  }`}
                >
                  <span className="block truncate">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filter Toggle */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Bán kính & Lương sàn</span>
          {showAdvanced ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
          <Zap className="w-3 h-3" />
          <span>{matchCount} ca phù hợp</span>
        </div>
      </div>

      {/* Advanced Filter Content */}
      {showAdvanced && (
        <div className="pt-2.5 border-t border-slate-800 space-y-2.5 bg-slate-950 p-2.5 rounded-md">
          {/* Radius Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1 text-slate-400">
              <span className="flex items-center gap-1">
                <Navigation className="w-3 h-3 text-slate-500" /> Bán kính tối đa:
              </span>
              <span className="font-mono font-medium text-white">
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
              className="w-full h-1.5 bg-slate-800 rounded-md appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Hourly Wage Floor */}
          <div>
            <div className="flex justify-between text-xs mb-1 text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" /> Lương sàn kỳ vọng:
              </span>
              <span className="font-mono font-medium text-emerald-400">
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
              className="w-full h-1.5 bg-slate-800 rounded-md appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
