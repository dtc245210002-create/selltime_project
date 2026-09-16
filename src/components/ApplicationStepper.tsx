"use client";

import React from "react";
import { Check, Clock, Eye, MessageSquare, ShieldCheck } from "lucide-react";

export type ApplicationStep = "APPLIED" | "REVIEWING" | "INTERVIEWING" | "ACCEPTED" | "CHECKED_IN";

interface ApplicationStepperProps {
  currentStep?: ApplicationStep;
  compact?: boolean;
}

const STEPS: { id: ApplicationStep; label: string; shortLabel: string; icon: any }[] = [
  { id: "APPLIED", label: "Đã gửi ứng tuyển", shortLabel: "Đã gửi", icon: Clock },
  { id: "REVIEWING", label: "Chủ quán xem hồ sơ", shortLabel: "Đã xem", icon: Eye },
  { id: "INTERVIEWING", label: "Đang trao đổi chat", shortLabel: "Đang chat", icon: MessageSquare },
  { id: "ACCEPTED", label: "Được nhận vào ca", shortLabel: "Được nhận", icon: Check },
  { id: "CHECKED_IN", label: "Đã xác nhận & Ký quỹ", shortLabel: "Ký quỹ", icon: ShieldCheck },
];

export function ApplicationStepper({
  currentStep = "INTERVIEWING",
  compact = false,
}: ApplicationStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
        <span>Tiến trình ứng tuyển ca làm:</span>
        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-indigo-100">
          Bước {currentIndex + 1}/5: {STEPS[currentIndex]?.shortLabel}
        </span>
      </div>

      {compact ? (
        /* Thanh tiến trình mini */
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`flex-1 border-r border-white last:border-0 transition-all ${
                idx <= currentIndex ? "bg-gradient-to-r from-indigo-600 to-emerald-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      ) : (
        /* Thanh tiến trình chi tiết đầy đủ 5 bước */
        <div className="space-y-1.5 pt-1">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isUpcoming = idx > currentIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                  isCurrent
                    ? "bg-indigo-50 border border-indigo-200 shadow-2xs text-indigo-950 font-bold"
                    : isCompleted
                    ? "text-slate-600 font-medium"
                    : "text-slate-300 font-normal"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs transition-colors ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-indigo-600 text-white animate-pulse shadow-xs"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1 text-[11px] leading-tight">
                  <span className="block">{step.label}</span>
                </div>

                {isCurrent && (
                  <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-black uppercase">
                    Hiện tại
                  </span>
                )}
                {isCompleted && (
                  <span className="text-[9px] text-emerald-600 font-bold">
                    ✓ Xong
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
