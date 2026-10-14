"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { VerifiedIdentity } from "@/domain/types";
import {
  Mail,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  LogOut,
  Sparkles,
  AlertCircle,
  ExternalLink,
  KeyRound,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { useViewMode } from "@/components/ViewModeContext";

export default function AccountPage() {
  const { theme, toggleTheme, language, toggleLanguage, t } = useViewMode();
  const [identity, setIdentity] = useState<VerifiedIdentity | null>(null);
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">("login");
  const [notice, setNotice] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  async function action(operation: string, body?: object, customHeaders?: Record<string, string>) {
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/auth/${operation}`, {
        method: operation === "session" ? "GET" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(customHeaders || {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
        credentials: "same-origin",
      });
      const result = await response.json();
      if (!response.ok) {
        if (operation === "session") setIdentity(null);
        throw new Error(result.error || "Thao tác không thành công.");
      }
      if (operation === "logout") {
        setIdentity(null);
        setNotice({ type: "info", message: "Đã đăng xuất phiên làm việc an toàn." });
      } else if (operation === "forgot-password") {
        setNotice({
          type: "success",
          message: result.message || `Email khôi phục mật khẩu đã được gửi tới ${email}. Vui lòng mở hộp thư để đặt lại mật khẩu.`,
        });
      } else if (operation === "update-password") {
        setNotice({
          type: "success",
          message: "🎉 Mật khẩu đã được cập nhật thành công! Vui lòng đăng nhập bằng mật khẩu mới của bạn.",
        });
        setMode("login");
        setPassword("");
        setConfirmPassword("");
        setRecoveryToken(null);
      } else if (result.identity) {
        setIdentity(result.identity);
        setNotice({ type: "success", message: "Xác thực danh tính thành công qua Supabase Auth!" });
      }
      if (result.confirmationRequired) {
        setNotice({
          type: "success",
          message: `Email xác thực đã được gửi tới ${email}. Vui lòng mở hộp thư (kiểm tra cả mục Hộp thư đến và Thư rác/Spam), nhấp liên kết xác nhận rồi đăng nhập.`,
        });
        setMode("login");
      }
      if (operation === "signup" || operation === "login") {
        setPassword("");
      }
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Không thể kết nối đến máy chủ xác thực.",
      });
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const search = window.location.search;

      // 1. Kiểm tra luồng Reset Password qua email link
      if (hash.includes("type=recovery") || search.includes("type=recovery")) {
        const tokenMatch = hash.match(/access_token=([^&]+)/);
        if (tokenMatch) {
          setRecoveryToken(tokenMatch[1]);
          setMode("reset");
          setNotice({
            type: "info",
            message: "🔑 Xác thực yêu cầu khôi phục thành công! Vui lòng nhập mật khẩu mới cho tài khoản của bạn.",
          });
          try {
            window.history.replaceState(null, "", window.location.pathname);
          } catch {}
          return;
        }
      }

      // 2. Kiểm tra luồng Confirm Email đăng ký mới
      if (hash.includes("type=signup") || hash.includes("access_token") || search.includes("code=")) {
        setNotice({
          type: "success",
          message: "🎉 Xác thực email thành công qua Supabase! Tài khoản của bạn đã được kích hoạt. Hãy đăng nhập để bắt đầu.",
        });
        setMode("login");
        try {
          window.history.replaceState(null, "", window.location.pathname);
        } catch {}
      } else if (hash.includes("error=") || search.includes("error=")) {
        setNotice({
          type: "error",
          message: "Liên kết xác thực hoặc khôi phục đã hết hạn. Vui lòng thử lại.",
        });
      }
    }
    void action("session");
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <section className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative z-10 space-y-6">
        {/* Navigation link & Controls */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("Trở về sàn việc làm", "Back to Jobs")}</span>
          </Link>

          <div className="flex items-center gap-1.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white transition-colors"
              title={theme === "dark" ? t("Giao diện Sáng (Light)", "Switch to Light Mode") : t("Giao diện Tối (Dark)", "Switch to Dark Mode")}
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-purple-400" />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-2 py-0.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white transition-colors text-[11px] font-bold flex items-center gap-1"
              title={language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
            >
              <Globe className="w-3 h-3 text-indigo-400" />
              <span>{language === "vi" ? "VI" : "EN"}</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[10px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 shadow-inner">
            {mode === "forgot" || mode === "reset" ? (
              <KeyRound className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {identity
              ? t("Hồ Sơ Xác Thực", "Verified Profile")
              : mode === "forgot"
              ? t("Quên Mật Khẩu", "Forgot Password")
              : mode === "reset"
              ? t("Đặt Lại Mật Khẩu", "Reset Password")
              : mode === "signup"
              ? t("Đăng Ký Tài Khoản", "Create Account")
              : t("Đăng Nhập Tài Khoản", "Account Login")}
          </h1>
          <p className="text-xs text-slate-400">
            {identity
              ? t("Tài khoản chính thức đã được định danh trên cơ sở dữ liệu Supabase", "Official verified account on Supabase database")
              : mode === "forgot"
              ? t("Nhập email của bạn để nhận liên kết khôi phục mật khẩu qua Supabase", "Enter your email to receive a password reset link via Supabase")
              : mode === "reset"
              ? t("Tạo mật khẩu mới cho tài khoản của bạn (tối thiểu 8 ký tự)", "Create a new password for your account (min 8 characters)")
              : t("Hệ thống xác thực trực tuyến có bảo vệ xác nhận Email & Cookie HTTP-Only", "Cloud authentication with Email Verification & HTTP-Only Cookie protection")}
          </p>
        </div>

        {/* Notice alert */}
        {notice && (
          <div
            role="status"
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
              notice.type === "success"
                ? "bg-emerald-950/50 border-emerald-800/80 text-emerald-200"
                : notice.type === "error"
                ? "bg-rose-950/50 border-rose-800/80 text-rose-200"
                : "bg-slate-800/80 border-slate-700 text-slate-200"
            }`}
          >
            {notice.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : notice.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 leading-relaxed">{notice.message}</div>
          </div>
        )}

        {/* Authenticated View */}
        {identity ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  {identity.fullName ? identity.fullName.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm truncate">{identity.fullName}</span>
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {identity.role}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 truncate">{identity.email}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div>
                  <span className="block text-slate-500">Mã định danh:</span>
                  <span className="font-mono text-slate-300 truncate block">{identity.userId.slice(0, 12)}…</span>
                </div>
                <div>
                  <span className="block text-slate-500">Trạng thái:</span>
                  <span className="text-emerald-400 font-medium">Đã kích hoạt</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href="/"
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-purple-600/20"
              >
                <span>Vào sàn việc làm ngay</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void action("session")}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${busy ? "animate-spin" : ""}`} />
                  <span>Kiểm tra session</span>
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void action("logout")}
                  className="py-2 px-3 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        ) : mode === "forgot" ? (
          /* Quên Mật Khẩu Form */
          <div className="space-y-4">
            <form
              className="space-y-3.5"
              onSubmit={(e) => {
                e.preventDefault();
                void action("forgot-password", { email });
              }}
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email đã đăng ký tài khoản:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    required
                    type="email"
                    maxLength={120}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@tnut.edu.vn hoặc gmail của bạn"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/20 disabled:opacity-50"
              >
                {busy && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{busy ? "Đang gửi qua Supabase…" : "Gửi liên kết khôi phục qua Email"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setNotice(null);
                }}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-200 transition-colors block"
              >
                ← Quay lại Đăng nhập
              </button>
            </form>
          </div>
        ) : mode === "reset" ? (
          /* Đặt Lại Mật Khẩu Form */
          <div className="space-y-4">
            <form
              className="space-y-3.5"
              onSubmit={(e) => {
                e.preventDefault();
                if (password !== confirmPassword) {
                  setNotice({ type: "error", message: "Mật khẩu xác nhận không khớp." });
                  return;
                }
                const customHeaders = recoveryToken ? { Authorization: `Bearer ${recoveryToken}` } : undefined;
                void action("update-password", { password }, customHeaders);
              }}
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mật khẩu mới (tối thiểu 8 ký tự):</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    required
                    type="password"
                    minLength={8}
                    maxLength={128}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Xác nhận mật khẩu mới:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    required
                    type="password"
                    minLength={8}
                    maxLength={128}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/20 disabled:opacity-50"
              >
                {busy && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{busy ? "Đang cập nhật…" : "Lưu Mật Khẩu Mới"}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Form Login / Signup */
          <div className="space-y-4">
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setNotice(null);
                }}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  mode === "login" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t("Đăng nhập", "Sign In")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setNotice(null);
                }}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  mode === "signup" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t("Tạo tài khoản mới", "Create Account")}
              </button>
            </div>

            <form
              className="space-y-3.5"
              onSubmit={(event) => {
                event.preventDefault();
                void action(mode === "signup" ? "signup" : "login", {
                  email,
                  password,
                  ...(mode === "signup" ? { full_name: name } : {}),
                });
              }}
            >
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t("Họ và tên:", "Full Name:")}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      required
                      maxLength={100}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("Nguyễn Đức Huy", "John Doe")}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t("Email đăng ký:", "Email Address:")}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    required
                    type="email"
                    maxLength={120}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@tnut.edu.vn / user@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    {t("Mật khẩu (tối thiểu 8 ký tự):", "Password (min 8 characters):")}
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setNotice(null);
                      }}
                      className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {t("Quên mật khẩu?", "Forgot password?")}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    required
                    type="password"
                    minLength={8}
                    maxLength={128}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/20 disabled:opacity-50"
              >
                {busy && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {busy
                    ? t("Đang xử lý qua Supabase…", "Processing with Supabase…")
                    : mode === "signup"
                    ? t("Đăng ký Candidate (Gửi email xác thực)", "Sign Up as Candidate (Verify Email)")
                    : t("Đăng nhập Candidate", "Sign In as Candidate")}
                </span>
              </button>
            </form>

            {/* Email Verification Guide hint */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-purple-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quy trình xác thực Email an toàn:</span>
              </div>
              <p className="leading-relaxed">
                Tài khoản được bảo vệ bằng hệ thống Supabase Auth đám mây. Bạn có thể đăng ký, xác thực hoặc khôi phục mật khẩu thông qua hòm thư Gmail của mình.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}



