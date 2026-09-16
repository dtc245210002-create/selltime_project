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
  Briefcase,
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
    { id: "ALL", label: "Tất cả hình thức" },
    { id: "PART_TIME", label: "Bán thời gian" },
    { id: "GIG", label: "Thời vụ / Gig" },
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

    // Trích xuất từ khóa ngành nghề
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
      `✨ AI đã áp dụng: Khung giờ [${periodNames}]${keyword ? ` • Từ khóa [${keyword}]` : ""}`
    );
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-5 rounded-b-[28px] shadow-lg relative overflow-hidden space-y-3.5">
      {/* Background Decorative Circles */}
      <div className="absolute -right-10 -top-10 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

      {/* Header Catchphrase */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-indigo-200 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md">
            ⚡ Time-First Search UX
          </span>
          <h2 className="text-xl font-bold mt-1 text-white tracking-tight">
            Hôm nay bạn muốn bán bao nhiêu giờ?
          </h2>
        </div>
      </div>

      {/* Ô TÌM KIẾM TỪ KHÓA & NÚT AI */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-indigo-200 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo chức danh, địa điểm, tên quán..."
            value={criteria.search_keyword || ""}
            onChange={(e) =>
              onChange({ ...criteria, search_keyword: e.target.value })
            }
            className="w-full bg-white/10 text-white placeholder-indigo-200/70 text-xs rounded-xl pl-9 pr-8 py-2 border border-white/20 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all"
          />
          {criteria.search_keyword && (
            <button
              onClick={() => onChange({ ...criteria, search_keyword: "" })}
              className="absolute right-2.5 p-1 text-indigo-200 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Nút bật Lọc thông minh bằng AI (Natural Language Filter) */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAiPrompt(!showAiPrompt)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 hover:text-amber-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showAiPrompt ? "Thu gọn Lọc AI" : "✨ Lọc bằng ngôn ngữ tự nhiên (AI)"}</span>
          </button>

          {/* Tag hình thức công việc */}
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
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-amber-400 text-indigo-950 border-amber-300 font-bold shadow-xs"
                      : "bg-white/10 text-white/80 border-white/10 hover:bg-white/20"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Khung nhập liệu AI tự nhiên */}
        {showAiPrompt && (
          <div className="bg-black/30 border border-amber-400/40 rounded-xl p-3 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="VD: Em rảnh tối, biết pha chế cà phê gần TNUT..."
                value={aiPromptText}
                onChange={(e) => setAiPromptText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiFilter()}
                className="flex-1 bg-white/10 text-white placeholder-indigo-200/60 text-xs rounded-lg px-2.5 py-1.5 border border-white/20 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <button
                type="button"
                onClick={() => handleAiFilter()}
                className="bg-amber-400 hover:bg-amber-500 text-indigo-950 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1 shrink-0 transition-all active:scale-95"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Lọc AI</span>
              </button>
            </div>

            {/* Gợi ý mẫu 1-chạm */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-indigo-200">Gợi ý:</span>
              <button
                type="button"
                onClick={() => {
                  setAiPromptText("Rảnh tối, pha chế The Cuppa");
                  handleAiFilter("Rảnh tối, pha chế The Cuppa");
                }}
                className="text-[10px] bg-white/10 hover:bg-white/20 text-amber-200 px-2 py-0.5 rounded-md transition-colors"
              >
                🌙 Tối • Pha chế
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiPromptText("Rảnh sáng, phục vụ bàn gần TNUT");
                  handleAiFilter("Rảnh sáng, phục vụ bàn gần TNUT");
                }}
                className="text-[10px] bg-white/10 hover:bg-white/20 text-amber-200 px-2 py-0.5 rounded-md transition-colors"
              >
                🌅 Sáng • Phục vụ
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiPromptText("Rảnh chiều, làm thu ngân Circle K");
                  handleAiFilter("Rảnh chiều, làm thu ngân Circle K");
                }}
                className="text-[10px] bg-white/10 hover:bg-white/20 text-amber-200 px-2 py-0.5 rounded-md transition-colors"
              >
                ☀️ Chiều • Thu ngân
              </button>
            </div>

            {aiFeedback && (
              <p className="text-[10px] font-semibold text-emerald-300 pt-1">
                {aiFeedback}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Main Big Hour Display & Slider */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
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
