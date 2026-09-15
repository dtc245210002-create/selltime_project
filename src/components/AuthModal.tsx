"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  Phone,
  UserCheck,
  Store,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
} from "lucide-react";
import { User as UserType, UserRole } from "../domain/types";
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
  const [selectedRole, setSelectedRole] = useState<UserRole>("CANDIDATE");

  // Form input states
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  // 1. Đăng nhập nhanh tài khoản mẫu (Demo)
  const handleQuickLogin = (role: UserRole) => {
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
      if (!identifier.trim() || !password.trim()) {
        setErrorMsg("Vui lòng nhập đầy đủ Email/Số điện thoại và Mật khẩu.");
        return;
      }

      // Kiểm tra nếu là email/sđt của chủ quán
      if (
        identifier.toLowerCase().includes("lan") ||
        identifier.includes("0912") ||
        identifier.toLowerCase().includes("cuppa")
      ) {
        onLoginSuccess(MOCK_EMPLOYER_USER);
      } else {
        // Mặc định hoặc sinh viên
        onLoginSuccess({
          ...MOCK_CANDIDATE_USER,
          email: identifier.includes("@") ? identifier : MOCK_CANDIDATE_USER.email,
        });
      }
      onClose();
    } else {
      // Đăng ký mới
      if (!fullName.trim() || !identifier.trim() || !password.trim()) {
        setErrorMsg("Vui lòng điền đầy đủ các thông tin bắt buộc.");
        return;
      }

      const newUser: UserType = {
        id: `user_${Date.now()}`,
        email: identifier.includes("@") ? identifier : `${identifier}@selltime.vn`,
        phone: !identifier.includes("@") ? identifier : "0988888888",
        full_name: fullName,
        role: selectedRole,
        avatar_url:
          selectedRole === "CANDIDATE"
            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        is_kyc_verified: true,
        created_at: new Date().toISOString(),
      };

      onLoginSuccess(newUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-slate-100 overflow-hidden">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-lg shadow-md mb-2">
            ST
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {mode === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản Sell Time"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === "login"
              ? "Đăng nhập để bán giờ rảnh hoặc tuyển dụng tức thì"
              : "Bắt đầu kiếm tiền từ quỹ thời gian rảnh của bạn"}
          </p>
        </div>

        {/* Tabs Chuyển Đổi: Đăng Nhập / Đăng Ký */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === "login"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === "register"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Đăng ký mới
          </button>
        </div>

        {/* PHẦN ĐĂNG NHẬP NHANH 1-CHẠM (Dành cho Demo / Trải nghiệm ngay) */}
        <div className="mb-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3">
          <span className="text-[11px] font-bold text-indigo-900 block mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Đăng nhập nhanh 1-chạm (Tài khoản mẫu):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("CANDIDATE")}
              className="py-2 px-2.5 bg-white hover:bg-indigo-600 hover:text-white text-slate-800 border border-indigo-200 rounded-xl text-left text-xs font-bold transition-all group shadow-xs"
            >
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600 group-hover:text-white" />
                <span className="truncate">SV Huy (TNUT)</span>
              </div>
              <span className="text-[10px] text-slate-400 group-hover:text-indigo-100 font-normal block truncate">
                Sinh viên tìm việc
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("EMPLOYER")}
              className="py-2 px-2.5 bg-white hover:bg-indigo-600 hover:text-white text-slate-800 border border-indigo-200 rounded-xl text-left text-xs font-bold transition-all group shadow-xs"
            >
              <div className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-indigo-600 group-hover:text-white" />
                <span className="truncate">Chị Lan (Cafe)</span>
              </div>
              <span className="text-[10px] text-slate-400 group-hover:text-indigo-100 font-normal block truncate">
                Chủ cơ sở tuyển dụng
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 my-3 text-[11px] text-slate-400">
          <div className="h-px bg-slate-200 flex-1" />
          <span>Hoặc đăng nhập bằng tài khoản</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMsg && (
          <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form Đăng Nhập / Đăng Ký */}
        <form onSubmit={handleFormSubmit} className="space-y-3">
          {/* Khi đăng ký: Chọn vai trò */}
          {mode === "register" && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Bạn tham gia với tư cách gì?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("CANDIDATE")}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    selectedRole === "CANDIDATE"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Sinh viên tìm việc</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("EMPLOYER")}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    selectedRole === "EMPLOYER"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Chủ quán / Tuyển dụng</span>
                </button>
              </div>
            </div>
          )}

          {/* Họ và tên (chỉ hiển thị khi đăng ký) */}
          {mode === "register" && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Họ và tên đầy đủ:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn An"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Email hoặc Số điện thoại */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Email hoặc Số điện thoại:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="VD: sinhvien@gmail.com hoặc 0987654321"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">
                Mật khẩu:
              </label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => alert("Chức năng quên mật khẩu qua SMS OTP đang được kết nối!")}
                  className="text-[11px] text-indigo-600 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Nút bấm Đăng Nhập / Đăng Ký */}
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 mt-2"
          >
            <span>{mode === "login" ? "Đăng Nhập Ngay" : "Hoàn Tất Đăng Ký"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer bảo mật */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Bảo mật thông tin & Định danh CCCD chuẩn eKYC</span>
        </div>
      </div>
    </div>
  );
}
