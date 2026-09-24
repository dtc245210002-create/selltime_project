"use client";

import React from "react";
import { Lock, LogIn, Sparkles, ShieldCheck, CheckCircle2, UserCheck, Store } from "lucide-react";

interface LoginRequiredCardProps {
  title: string;
  description: string;
  features?: string[];
  roleHint?: "CANDIDATE" | "EMPLOYER";
  onOpenAuth: () => void;
}

export function LoginRequiredCard({
  title,
  description,
  features = [],
  roleHint = "CANDIDATE",
  onOpenAuth,
}: LoginRequiredCardProps) {
  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-center space-y-5 animate-in fade-in duration-200">
      {/* Icon Badge */}
      <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-1.5 border border-slate-700 shadow-md flex items-center justify-center">
        <img
          src="/logo.png"
          alt="SellTime Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>

      {/* Feature checklist */}
      {features.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-left space-y-2">
          <span className="text-[11px] font-semibold text-slate-300 block">
            Quyền lợi sau khi đăng nhập:
          </span>
          <div className="space-y-1.5">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="pt-2 space-y-2">
        <button
          onClick={onOpenAuth}
          className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md shadow-purple-900/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <LogIn className="w-4 h-4" />
          <span>Đăng Nhập / Đăng Ký Ngay</span>
        </button>
        <p className="text-[11px] text-slate-500">
          Chỉ mất 10 giây • Hỗ trợ đăng nhập nhanh tài khoản mẫu
        </p>
      </div>
    </div>
  );
}
