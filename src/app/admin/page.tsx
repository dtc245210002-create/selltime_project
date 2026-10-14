"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Briefcase,
  DollarSign,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Search,
  Filter,
  UserCheck,
  Building2,
  Lock,
  RefreshCw,
  Sparkles,
  Zap,
  TrendingUp,
  FileCheck,
  ChevronRight,
  LogOut,
  ExternalLink,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import type { User, Shift, UserRole } from "@/domain/types";
import { useViewMode } from "@/components/ViewModeContext";

type AdminTab = "overview" | "users" | "shifts" | "escrow";

interface AdminStats {
  totalUsers: number;
  candidates: number;
  employers: number;
  totalShifts: number;
  sosShiftsCount: number;
  totalEscrow: number;
  avgTrustBattery: number;
  verifiedKycPercent: number;
}

interface EscrowTx {
  id: string;
  code: string;
  title: string;
  amount: number;
  type: "HELD" | "RELEASED" | "REFUNDED";
  status: string;
  created_at: string;
  employer_name?: string;
}

export default function AdminPortalPage() {
  const { theme, toggleTheme, language, toggleLanguage, t } = useViewMode();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [escrowTxs, setEscrowTxs] = useState<EscrowTx[]>([]);
  const [mode, setMode] = useState<"LIVE" | "SANDBOX">("SANDBOX");
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Bộ lọc cho danh sách người dùng
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [kycFilter, setKycFilter] = useState<"ALL" | "VERIFIED" | "UNVERIFIED">("ALL");

  // Nạp dữ liệu ban đầu
  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Thống kê
      const resStats = await fetch("/api/admin?resource=overview");
      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data.stats);
        if (data.mode) setMode(data.mode);
      }

      // 2. Người dùng
      const resUsers = await fetch("/api/admin?resource=users");
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsers(data.users || []);
      }

      // 3. Ca làm việc
      const resShifts = await fetch("/api/admin?resource=shifts");
      if (resShifts.ok) {
        const data = await resShifts.json();
        setShifts(data.shifts || []);
      }

      // 4. Ký quỹ Escrow
      const resEscrow = await fetch("/api/admin?resource=escrow");
      if (resEscrow.ok) {
        const data = await resEscrow.json();
        setEscrowTxs(data.transactions || []);
      }
    } catch (err: any) {
      setNotice({ type: "error", text: "Không thể nạp dữ liệu quản trị: " + err?.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  // Xử lý đổi vai trò người dùng (CANDIDATE <-> EMPLOYER)
  const handleUpdateRole = async (userId: string, currentRole: UserRole) => {
    const newRole: UserRole = currentRole === "EMPLOYER" ? "CANDIDATE" : "EMPLOYER";
    setActionBusy(`role_${userId}`);
    setNotice(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-role",
          user_id: userId,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Thao tác thất bại");

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setNotice({
        type: "success",
        text: `Đã cập nhật quyền thành công: ${newRole === "EMPLOYER" ? "Cấp quyền Chủ Quán (EMPLOYER)" : "Thu hồi về Ứng Viên (CANDIDATE)"}`,
      });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setActionBusy(null);
    }
  };

  // Xử lý duyệt hoặc thu hồi eKYC
  const handleToggleKyc = async (userId: string, currentVerified: boolean) => {
    const nextState = !currentVerified;
    setActionBusy(`kyc_${userId}`);
    setNotice(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-kyc",
          user_id: userId,
          is_verified: nextState,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Thao tác thất bại");

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_kyc_verified: nextState } : u))
      );
      setNotice({
        type: "success",
        text: nextState ? "Đã xác thực CCCD/eKYC thành công!" : "Đã hủy xác thực eKYC của người dùng.",
      });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setActionBusy(null);
    }
  };

  // Xử lý can thiệp ca làm việc (Khóa ca hoặc Mở lại ca)
  const handleModerateShift = async (shiftId: string, targetStatus: "CANCELLED" | "OPEN") => {
    setActionBusy(`shift_${shiftId}`);
    setNotice(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "moderate-shift",
          shift_id: shiftId,
          status: targetStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Thao tác thất bại");

      setShifts((prev) =>
        prev.map((s) => (s.id === shiftId ? { ...s, status: targetStatus } : s))
      );
      setNotice({
        type: "success",
        text: targetStatus === "CANCELLED" ? "Đã khóa và gỡ bỏ ca làm việc vi phạm!" : "Đã mở lại ca làm việc.",
      });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setActionBusy(null);
    }
  };

  // Lọc người dùng
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

    const matchesKyc =
      kycFilter === "ALL" ||
      (kycFilter === "VERIFIED" && u.is_kyc_verified) ||
      (kycFilter === "UNVERIFIED" && !u.is_kyc_verified);

    return matchesSearch && matchesRole && matchesKyc;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans flex flex-col">
      {/* 1. ADMIN TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("Về Sàn Việc Làm", "Back to Jobs")}</span>
          </Link>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-md shadow-purple-600/30">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">SellTime Admin Console</span>
                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                  Role: ADMIN
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                {t("Hệ thống phân quyền & giám sát sàn việc làm", "RBAC & Marketplace Oversight System")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Badge Trạng thái kết nối */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-full text-xs">
            <div className={`w-2 h-2 rounded-full animate-pulse ${mode === "LIVE" ? "bg-emerald-400" : "bg-amber-400"}`} />
            <span className="text-slate-300 font-medium text-[11px]">
              {mode === "LIVE" ? "Supabase Cloud LIVE" : "Admin Sandbox Demo"}
            </span>
          </div>

          {/* Theme Toggle (Sáng / Tối) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center shadow-sm"
            title={theme === "dark" ? t("Chuyển sang Giao diện Sáng (Light)", "Switch to Light Mode") : t("Chuyển sang Giao diện Tối (Dark)", "Switch to Dark Mode")}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-purple-400 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Language Switcher (VI / EN) */}
          <button
            onClick={toggleLanguage}
            className="px-2 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm"
            title={language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === "vi" ? "VI" : "EN"}</span>
          </button>

          <button
            onClick={() => void loadAdminData()}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
            title={t("Làm mới dữ liệu", "Refresh Data")}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
          </button>
        </div>
      </header>

      {/* 2. THÔNG BÁO NOTICE BANNER */}
      {notice && (
        <div
          className={`px-4 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
            notice.type === "success"
              ? "bg-emerald-950/70 border-emerald-800/80 text-emerald-300"
              : "bg-rose-950/70 border-rose-800/80 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2 mx-auto max-w-7xl w-full">
            {notice.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-xs opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* 3. TABS NAVIGATION */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2.5 overflow-x-auto py-2.5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all shrink-0 ${
              activeTab === "overview"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t("Tổng Quan & KPIs", "Overview & KPIs")}</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all shrink-0 ${
              activeTab === "users"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t("Người Dùng & Phân Quyền", "Users & RBAC")} ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("shifts")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all shrink-0 ${
              activeTab === "shifts"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>{t("Giám Sát Ca Làm", "Shifts Monitoring")} ({shifts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("escrow")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all shrink-0 ${
              activeTab === "escrow"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>{t("Sổ Quỹ Escrow VietQR", "Escrow Treasury")} ({escrowTxs.length})</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN DASHBOARD CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* ===================== TAB 1: TỔNG QUAN ===================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* 4 THẺ KPI CHÍNH */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Thẻ 1: Tổng người dùng */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md relative overflow-hidden group hover:border-purple-500/40 transition-colors">
                <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm sm:text-base text-slate-400 font-bold">{t("Tổng người dùng", "Total Users")}</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white">{stats?.totalUsers ?? users.length}</div>
                <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-medium">
                  <span className="text-emerald-400 font-bold">{users.filter((u) => u.role === "CANDIDATE").length} SV</span>
                  <span>•</span>
                  <span className="text-blue-400 font-bold">{users.filter((u) => u.role === "EMPLOYER").length} Chủ Quán</span>
                </div>
              </div>

              {/* Thẻ 2: Ca làm việc */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm sm:text-base text-slate-400 font-bold">{t("Ca làm hoạt động", "Active Shifts")}</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white">{shifts.length}</div>
                <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-medium">
                  <span className="text-rose-400 font-bold flex items-center gap-0.5">
                    <Zap className="w-3.5 h-3.5 fill-rose-400" />
                    {shifts.filter((s) => s.is_sos).length} ca SOS
                  </span>
                  <span>•</span>
                  <span className="text-slate-300 font-semibold">{shifts.filter((s) => s.status === "OPEN").length} đang mở</span>
                </div>
              </div>

              {/* Thẻ 3: Quỹ Escrow bảo chứng */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md relative overflow-hidden group hover:border-amber-500/40 transition-colors">
                <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm sm:text-base text-slate-400 font-bold">{t("Quỹ Escrow VietQR", "Escrow Treasury")}</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-amber-400">
                  {(stats?.totalEscrow ?? 401000).toLocaleString("vi-VN")} đ
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-medium">
                  <span className="text-emerald-400 font-bold">Giải ngân 3s</span>
                  <span>•</span>
                  <span>Napas 24/7</span>
                </div>
              </div>

              {/* Thẻ 4: Điểm tin cậy & KYC */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
                <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm sm:text-base text-slate-400 font-bold">{t("Điểm Uy Tín PartyMode", "PartyMode Trust")}</span>
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-cyan-400">98%</div>
                <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-medium">
                  <span className="text-emerald-400 font-bold">
                    {Math.round((users.filter((u) => u.is_kyc_verified).length / Math.max(users.length, 1)) * 100)}% eKYC
                  </span>
                  <span>•</span>
                  <span>Chống bùng ca 2 lớp</span>
                </div>
              </div>
            </div>

            {/* BẢNG ĐIỀU HƯỚNG VÀ AUDIT LOGS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cột 1 & 2: Phân tích cơ cấu và Trạng thái kiểm toán */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span>{t("Cơ Chế Phân Quyền & Bảo Vệ Hệ Thống (RBAC)", "Role-Based Access Control (RBAC)")}</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        {t("Quy định bảo mật ba tầng: CANDIDATE, EMPLOYER và ADMIN", "Three-tier security model: CANDIDATE, EMPLOYER and ADMIN")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base font-bold text-emerald-400">CANDIDATE</span>
                        <span className="text-xs font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded">Tự động</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                        Mặc định khi đăng ký tài khoản. Có quyền tìm kiếm theo giờ rảnh, ứng tuyển 1-chạm, điểm danh GPS 100m và nhận lương qua ví.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base font-bold text-blue-400">EMPLOYER</span>
                        <span className="text-xs font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded">Admin cấp</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                        Dành cho chủ quán F&B/Doanh nghiệp. Có quyền đăng ca làm, ký quỹ ngân sách ca SOS, duyệt hồ sơ ứng viên và quản lý mã PIN quầy.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base font-bold text-purple-400">ADMIN</span>
                        <span className="text-xs font-bold bg-purple-950 text-purple-300 px-2 py-0.5 rounded">Toàn quyền</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                        Toàn quyền phân quyền, duyệt eKYC căn cước công dân, can thiệp ca làm vi phạm và kiểm toán luồng tiền ký quỹ Escrow.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hoạt động kiểm toán mới nhất */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-400" />
                    <span>{t("Nhật Ký Hoạt Động & Kiểm Toán Gần Nhất (Audit Trail)", "Recent Audit Trail & Activity Log")}</span>
                  </h3>
                  <div className="divide-y divide-slate-800/80 text-sm">
                    <div className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-100 text-sm sm:text-base">Xác thực eKYC tài khoản: Nguyễn Đức Huy (TNUT)</p>
                          <p className="text-xs sm:text-sm text-slate-400">CCCD: 019283746512 • ĐH Kỹ thuật Công nghiệp</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">Vừa xong</span>
                    </div>

                    <div className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-100 text-sm sm:text-base">Ký quỹ Escrow ca SOS #shift_sos_01 (The Cuppa Coffee)</p>
                          <p className="text-xs sm:text-sm text-slate-400">Khóa 153.000đ • VietQR Napas 24/7</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">15 phút trước</span>
                    </div>

                    <div className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-100 text-sm sm:text-base">Cấp quyền EMPLOYER cho: Hoàng Thị Lan</p>
                          <p className="text-xs sm:text-sm text-slate-400">Doanh nghiệp F&B: The Cuppa Coffee & Tea</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">1 giờ trước</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột 3: Thao tác nhanh của Quản trị viên */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-400" />
                    <span>Lối Tắt Quản Trị Nhanh</span>
                  </h3>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => setActiveTab("users")}
                      className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left text-sm font-semibold text-slate-200 flex items-center justify-between border border-slate-700/60 transition-colors group"
                    >
                      <span className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span>Phân quyền người dùng ({users.length})</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => setActiveTab("shifts")}
                      className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left text-sm font-semibold text-slate-200 flex items-center justify-between border border-slate-700/60 transition-colors group"
                    >
                      <span className="flex items-center gap-2.5">
                        <Briefcase className="w-4 h-4 text-emerald-400" />
                        <span>Quản lý ca làm việc ({shifts.length})</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => setActiveTab("escrow")}
                      className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left text-sm font-semibold text-slate-200 flex items-center justify-between border border-slate-700/60 transition-colors group"
                    >
                      <span className="flex items-center gap-2.5">
                        <DollarSign className="w-4 h-4 text-amber-400" />
                        <span>Kiểm toán Ký quỹ Escrow</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/50 text-xs sm:text-sm text-purple-200/90 space-y-1.5">
                    <p className="font-bold text-purple-200 flex items-center gap-2 text-xs sm:text-sm">
                      <ShieldAlert className="w-4 h-4" />
                      Quy tắc an toàn hệ thống:
                    </p>
                    <p className="leading-relaxed">
                      Chỉ người dùng có vai trò ADMIN mới có thể nâng cấp tài khoản lên Chủ Quán (EMPLOYER) hoặc phê duyệt hồ sơ pháp lý CCCD.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN ===================== */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* THANH TÌM KIẾM & BỘ LỌC */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center gap-3 justify-between">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên, email, SĐT..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto">
                {/* Lọc Role */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-300 focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="ALL">Tất cả vai trò</option>
                  <option value="CANDIDATE">Chỉ Ứng Viên (CANDIDATE)</option>
                  <option value="EMPLOYER">Chỉ Chủ Quán (EMPLOYER)</option>
                  <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
                </select>

                {/* Lọc KYC */}
                <select
                  value={kycFilter}
                  onChange={(e) => setKycFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-300 focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="ALL">Tất cả KYC</option>
                  <option value="VERIFIED">Đã xác thực eKYC</option>
                  <option value="UNVERIFIED">Chưa xác thực</option>
                </select>
              </div>
            </div>

            {/* BẢNG NGƯỜI DÙNG */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/80 text-slate-300 font-bold border-b border-slate-800 text-sm sm:text-base">
                    <tr>
                      <th className="p-4">Người dùng</th>
                      <th className="p-4">Liên hệ</th>
                      <th className="p-4">Vai trò (Role)</th>
                      <th className="p-4">Định danh eKYC</th>
                      <th className="p-4 text-right">Hành động Phân quyền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                          Không tìm thấy người dùng phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const isBusy = actionBusy === `role_${user.id}` || actionBusy === `kyc_${user.id}`;
                        const isAdminUser = user.role === "ADMIN";

                        return (
                          <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                            {/* Cột 1: Thông tin & Avatar */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                                  alt={user.full_name}
                                  className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                                    <span>{user.full_name}</span>
                                    {user.is_kyc_verified && (
                                      <span title="Đã xác thực CCCD">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-400 font-mono">ID: {user.id}</div>
                                </div>
                              </div>
                            </td>

                            {/* Cột 2: Email & SĐT */}
                            <td className="p-4">
                              <div className="text-slate-200 font-medium text-sm">{user.email}</div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">{user.phone}</div>
                            </td>

                            {/* Cột 3: Vai trò Badge */}
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold border ${
                                  user.role === "ADMIN"
                                    ? "bg-purple-950/80 text-purple-300 border-purple-800"
                                    : user.role === "EMPLOYER"
                                    ? "bg-blue-950/80 text-blue-300 border-blue-800"
                                    : "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                                }`}
                              >
                                {user.role === "ADMIN" && <ShieldAlert className="w-3.5 h-3.5" />}
                                {user.role === "EMPLOYER" && <Building2 className="w-3.5 h-3.5" />}
                                {user.role === "CANDIDATE" && <UserCheck className="w-3.5 h-3.5" />}
                                <span>{user.role}</span>
                              </span>
                            </td>

                            {/* Cột 4: eKYC Status */}
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-lg ${
                                    user.is_kyc_verified
                                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/80"
                                      : "bg-slate-950 text-slate-400 border border-slate-800"
                                  }`}
                                >
                                  {user.is_kyc_verified ? "Đã duyệt CCCD" : "Chưa xác minh"}
                                </span>

                                {!isAdminUser && (
                                  <button
                                    onClick={() => handleToggleKyc(user.id, user.is_kyc_verified || false)}
                                    disabled={isBusy}
                                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 underline underline-offset-2 ml-1"
                                  >
                                    {user.is_kyc_verified ? "Hủy duyệt" : "Duyệt nhanh"}
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Cột 5: Nút Thay đổi quyền */}
                            <td className="p-4 text-right">
                              {isAdminUser ? (
                                <span className="text-xs text-slate-400 font-semibold italic">Quản trị tối cao</span>
                              ) : (
                                <button
                                  onClick={() => handleUpdateRole(user.id, user.role)}
                                  disabled={isBusy}
                                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors inline-flex items-center gap-1.5 ${
                                    user.role === "EMPLOYER"
                                      ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
                                      : "bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border-purple-700/60 shadow-xs"
                                  }`}
                                >
                                  {isBusy && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                  <span>
                                    {user.role === "EMPLOYER" ? "Thu hồi về Candidate" : "Nâng cấp lên Employer"}
                                  </span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: GIÁM SÁT CA LÀM VIỆC ===================== */}
        {activeTab === "shifts" && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-400" />
                  <span>Giám Sát & Điều Phối Toàn Bộ Ca Làm Việc Trên Sàn</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                  Phát hiện ca làm vi phạm, hỗ trợ hủy khẩn cấp hoặc hoàn tiền ký quỹ
                </p>
              </div>
              <span className="text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                {shifts.length} Ca làm
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shifts.map((shift) => {
                const isCancelled = shift.status === "CANCELLED";
                const isBusy = actionBusy === `shift_${shift.id}`;

                return (
                  <div
                    key={shift.id}
                    className={`p-5 rounded-2xl bg-slate-900 border transition-all space-y-3.5 relative overflow-hidden ${
                      isCancelled ? "border-rose-900/50 opacity-60" : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {shift.is_sos && (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                              <Zap className="w-3 h-3 fill-rose-400" /> SOS Khẩn
                            </span>
                          )}
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                              shift.status === "OPEN"
                                ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                : shift.status === "CANCELLED"
                                ? "bg-rose-950 text-rose-300 border-rose-800"
                                : "bg-blue-950 text-blue-300 border-blue-800"
                            }`}
                          >
                            {shift.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-base sm:text-lg text-white line-clamp-1">{shift.title}</h4>
                        <p className="text-xs sm:text-sm text-slate-400 font-medium">{shift.employer_name}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs sm:text-sm space-y-1.5">
                      <div className="flex justify-between text-slate-300 font-medium">
                        <span className="text-slate-400">Thời gian ca:</span>
                        <span className="font-bold text-white font-mono">{shift.shift_start} - {shift.shift_end}</span>
                      </div>
                      <div className="flex justify-between text-slate-300 font-medium">
                        <span className="text-slate-400">Thù lao:</span>
                        <span className="font-bold text-emerald-400 font-mono text-sm sm:text-base">{shift.hourly_wage.toLocaleString()}đ/h</span>
                      </div>
                      <div className="flex justify-between text-slate-300 font-medium">
                        <span className="text-slate-400">Ngân sách ký quỹ:</span>
                        <span className="font-bold text-amber-400 font-mono text-sm sm:text-base">{shift.total_budget.toLocaleString()}đ</span>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-xs text-slate-400 font-mono">ID: {shift.id}</span>
                      <button
                        onClick={() => handleModerateShift(shift.id, isCancelled ? "OPEN" : "CANCELLED")}
                        disabled={isBusy}
                        className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                          isCancelled
                            ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                            : "bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60"
                        }`}
                      >
                        {isBusy ? "Đang xử lý..." : isCancelled ? "Mở lại ca" : "Khóa / Hủy ca vi phạm"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================== TAB 4: SỔ QUỸ ESCROW ===================== */}
        {activeTab === "escrow" && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  <span>Sổ Quỹ Ký Quỹ Tức Thì Escrow VietQR Napas 24/7</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                  Toàn bộ giao dịch khóa tiền bảo chứng ca làm và tự động giải ngân cho sinh viên
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm text-slate-400 font-semibold">Tổng quỹ hiện tại</div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">
                  {(stats?.totalEscrow ?? 401000).toLocaleString("vi-VN")} đ
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/80 text-slate-300 font-bold border-b border-slate-800 text-sm sm:text-base">
                    <tr>
                      <th className="p-4">Mã Giao Dịch</th>
                      <th className="p-4">Nội dung / Ca làm</th>
                      <th className="p-4">Chủ Quán Ký Quỹ</th>
                      <th className="p-4">Số tiền</th>
                      <th className="p-4">Loại Ký Quỹ</th>
                      <th className="p-4">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {escrowTxs.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-mono text-xs sm:text-sm text-purple-300 font-bold">{tx.code}</td>
                        <td className="p-4 font-bold text-white text-sm sm:text-base">{tx.title}</td>
                        <td className="p-4 text-slate-300 font-medium">{tx.employer_name || "Chủ cơ sở F&B"}</td>
                        <td className="p-4 font-bold text-amber-400 font-mono text-sm sm:text-base">
                          {tx.amount.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                              tx.type === "RELEASED"
                                ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                : tx.type === "HELD"
                                ? "bg-amber-950 text-amber-300 border-amber-800"
                                : "bg-slate-800 text-slate-300 border-slate-700"
                            }`}
                          >
                            {tx.type === "RELEASED" ? "ĐÃ GIẢI NGÂN (3S)" : "ĐANG TẠM GIỮ (HELD)"}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-xs sm:text-sm font-medium">
                          {new Date(tx.created_at).toLocaleString("vi-VN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
