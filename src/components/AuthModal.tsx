"use client";

import React, { useState } from "react";
import {
  X,
  Mail,
  UserCheck,
  Store,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
} from "lucide-react";
import { User as UserType } from "../domain/types";
import { MOCK_CANDIDATE_USER, MOCK_EMPLOYER_USER } from "../application/store";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [selectedRole, setSelectedRole] = useState<"CANDIDATE" | "EMPLOYER">("CANDIDATE");

  // Form input states
  const [identifier, setIdentifier] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  // 1. Đăng nhập nhanh tài khoản mẫu (Demo)
  const handleQuickLogin = (role: "CANDIDATE" | "EMPLOYER") => {
    if (role === "CANDIDATE") {
      onLoginSuccess(MOCK_CANDIDATE_USER);
    } else {
      onLoginSuccess(MOCK_EMPLOYER_USER);
    }
    onClose();
  };

  // 2. Xử lý Đăng nhập thông thường
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (mode === "login") {
      if (!identifier.trim()) {
        setErrorMsg("Vui lòng nhập tên hoặc biệt danh DEMO.");
        return;
      }

      // Phân luồng tài khoản
      if (
        identifier.toLowerCase().includes("lan") ||
        identifier.includes("0912") ||
        identifier.toLowerCase().includes("cuppa")
      ) {
        onLoginSuccess(MOCK_EMPLOYER_USER);
      } else {
        onLoginSuccess({
          ...MOCK_CANDIDATE_USER,
          email: identifier.includes("@") ? identifier : MOCK_CANDIDATE_USER.email,
        });
      }
      onClose();
    } else {
      // Đăng ký mới
      if (!fullName.trim() || !identifier.trim()) {
        setErrorMsg("Vui lòng điền đầy đủ các thông tin bắt buộc.");
        return;
      }

      const newUser: UserType = {
        id: `demo_user_${Date.now()}`,
        email: identifier.includes("@") ? identifier : `${identifier}@selltime.vn`,
        phone: !identifier.includes("@") ? identifier : "0988888888",
        full_name: fullName,
        role: selectedRole,
        avatar_url:
          selectedRole === "CANDIDATE"
            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        is_kyc_verified: false,
        created_at: new Date().toISOString(),
      };

      onLoginSuccess(newUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900 w-full max-w-md rounded-xl p-5 border border-slate-800 shadow-modal relative">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Modal */}
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-white rounded-xl mx-auto p-1 border border-slate-700 shadow-md mb-2 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="SellTime Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {mode === "login" ? "Chọn danh tính DEMO" : "Tạo hồ sơ DEMO"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {mode === "login"
              ? "Candidate DEMO / Employer DEMO — LIVE chưa được bật"
              : "Hồ sơ mô phỏng chỉ dùng trong trình duyệt"}
          </p>
        </div>

        {/* Tab chuyển đổi Đăng nhập / Đăng ký */}
        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg("");
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === "login"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Mở DEMO
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg("");
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === "register"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Tạo hồ sơ DEMO
          </button>
        </div>

        {/* Đăng nhập nhanh 1-chạm (Demo) */}
        <div className="mb-4 bg-slate-950 border border-slate-800 rounded-lg p-3">
          <span className="text-[11px] font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Chọn persona mẫu — không cần mật khẩu:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("CANDIDATE")}
              className="p-2 bg-slate-900 hover:bg-slate-850 hover:border-slate-700 border border-slate-800 rounded-md text-left transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-slate-200 truncate">Huy · Candidate DEMO</span>
              </div>
              <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                Tìm việc bán thời gian
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("EMPLOYER")}
              className="p-2 bg-slate-900 hover:bg-slate-850 hover:border-slate-700 border border-slate-800 rounded-md text-left transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-slate-200 truncate">Lan · Employer DEMO</span>
              </div>
              <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                Tuyển dụng & Ký quỹ DEMO
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 my-3 text-[11px] text-slate-500">
          <div className="h-px bg-slate-800 flex-1" />
          <span>Hoặc tùy chỉnh persona DEMO</span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-3 p-2 bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs rounded-md">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-3">
          {mode === "register" && (
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Vai trò của bạn:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("CANDIDATE")}
                  className={`p-2 rounded-md border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    selectedRole === "CANDIDATE"
                      ? "bg-purple-600 text-white border-purple-500"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Sinh viên</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("EMPLOYER")}
                  className={`p-2 rounded-md border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    selectedRole === "EMPLOYER"
                      ? "bg-purple-600 text-white border-purple-500"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Chủ cơ sở</span>
                </button>
              </div>
            </div>
          )}

          {mode === "register" && (
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Họ và tên:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Nguyễn Văn An"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-md pl-9 pr-3 py-2 focus:border-purple-500 focus:outline-none placeholder-slate-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Tên hoặc biệt danh DEMO:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Ví dụ: Huy hoặc Lan (dữ liệu mẫu)"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-md pl-9 pr-3 py-2 focus:border-purple-500 focus:outline-none placeholder-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 mt-2 shadow-sm"
          >
            <span>{mode === "login" ? "Mở DEMO" : "Tạo Hồ Sơ DEMO"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>DEMO local — chưa xác thực tài khoản hoặc eKYC</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800">
          <a
            href="/auth"
            className="w-full py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-purple-500/30 text-purple-300 hover:text-purple-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Mở Cổng Xác Thực Email Thật (Supabase Online)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
