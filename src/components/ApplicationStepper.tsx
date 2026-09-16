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
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
        <span>Tiến trình ứng tuyển:</span>
        <span className="text-purple-300 bg-purple-950/70 border border-purple-800/60 px-2 py-0.5 rounded-md text-[10px] font-mono">
          {currentIndex + 1}/5: {STEPS[currentIndex]?.shortLabel}
        </span>
      </div>

      {compact ? (
        /* Mini progress line */
        <div className="w-full bg-slate-950 h-1.5 rounded-md overflow-hidden flex border border-slate-800">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`flex-1 border-r border-slate-900 last:border-0 transition-all ${
                idx <= currentIndex ? "bg-purple-500" : "bg-slate-800"
              }`}
            />
          ))}
        </div>
      ) : (
        /* Detailed 5-step stepper */
        <div className="space-y-1 pt-1">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 p-1.5 rounded-md transition-colors ${
                  isCurrent
                    ? "bg-slate-950 border border-purple-800/80 text-white font-medium"
                    : isCompleted
                    ? "text-slate-300"
                    : "text-slate-600"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 text-xs ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-purple-600 text-white"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                </div>

                <div className="flex-1 text-[11px] leading-tight truncate">
                  <span className="truncate">{step.label}</span>
                </div>

                {isCurrent && (
                  <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800/60 px-1 py-0.2 rounded font-mono">
                    Hiện tại
                  </span>
                )}
                {isCompleted && (
                  <span className="text-[9px] text-emerald-400 font-mono">
                    ✓
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
