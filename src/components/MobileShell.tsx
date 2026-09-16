"use client";

import React, { useState } from "react";
import {
  Compass,
  CalendarCheck2,
  MessageSquare,
  UserCheck,
  BatteryCharging,
  Wifi,
  Signal,
  Smartphone,
  Monitor,
  Download,
  X,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Store,
} from "lucide-react";
import { User as UserType } from "../domain/types";

interface MobileShellProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  trustBattery: number;
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export function MobileShell({
  children,
  activeTab,
  onTabChange,
  trustBattery = 100,
  currentUser,
  onOpenAuth,
  onLogout,
}: MobileShellProps) {
  const [currentTime] = useState("19:42");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [showInstallModal, setShowInstallModal] = useState(false);

  const tabs = [
    { id: "explore", label: "Khám phá", icon: Compass },
    { id: "my-shifts", label: "Ca của tôi", icon: CalendarCheck2 },
    { id: "messages", label: "Tin nhắn", icon: MessageSquare, badge: 2 },
    { id: "profile", label: "Cá nhân", icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* ========================================================= */}
      {/* TOP HEADER: Branding, View Toggle, PWA & Login Controls   */}
      {/* ========================================================= */}
      <header className="bg-slate-900 text-white px-4 py-2.5 shadow-md shrink-0 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-base shadow-md">
              ST
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm tracking-tight text-white">
                  Sell Time Platform
                </h1>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-500/40">
                  Time-First Core
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Nền tảng kết nối thời gian rảnh theo giờ linh hoạt
              </p>
            </div>
          </div>

          {/* Controls: View Mode, PWA, User Login Session */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Toggle Giao diện Web / Mobile Preview */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700">
              <button
                onClick={() => setViewMode("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "desktop"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Xem trước chế độ Web màn hình rộng (Desktop Preview)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Xem trước Web</span>
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "mobile"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Xem trước chế độ ứng dụng di động (Mobile App Preview)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Xem trước Mobile</span>
              </button>
            </div>

            {/* Nút Tải / Dùng trên Điện thoại (PWA) */}
            <button
              onClick={() => setShowInstallModal(true)}
              className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cài đặt App</span>
            </button>

            {/* PHẦN USER AUTH TRÊN THANH HEADER */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                <div className="flex items-center gap-2">
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-indigo-400 shadow-sm"
                  />
                  <div className="hidden lg:block text-left">
                    <span className="text-xs font-bold text-white block leading-none">
                      {currentUser.full_name}
                    </span>
                    <span className="text-[10px] text-indigo-300 font-medium">
                      {currentUser.role === "CANDIDATE" ? "Sinh viên (SV)" : "Chủ cơ sở (Quán)"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow-md shadow-indigo-500/20 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 1. CHẾ ĐỘ GIAO DIỆN WEB TOÀN MÀN HÌNH (DESKTOP MODE)     */}
      {/* ========================================================= */}
      {viewMode === "desktop" ? (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col">
          {/* Desktop Navigation Sub-bar */}
          <div className="bg-white rounded-2xl p-2.5 mb-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <nav className="flex items-center gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* PartyMode Trust Badge & Auth Quick Status */}
            <div className="flex items-center gap-3 pr-2">
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold">
                <BatteryCharging className="w-4 h-4 text-emerald-600" />
                <span>Pin uy tín: {trustBattery}%</span>
              </div>
              <span className="text-xs text-slate-400 hidden md:inline">
                TP. Thái Nguyên • ĐH TNUT
              </span>
            </div>
          </div>

          {/* Desktop Content Container */}
          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            {children}
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* 2. CHẾ ĐỘ MÔ PHỎNG ĐIỆN THOẠI (MOBILE SMARTPHONE FRAME)  */
        /* ========================================================= */
        <div className="flex-1 flex justify-center items-center py-6 bg-slate-900">
          <div className="w-full sm:max-w-[440px] h-[850px] bg-slate-50 sm:rounded-[44px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] sm:border-[8px] sm:border-slate-800 flex flex-col overflow-hidden relative">
            {/* Smartphone Status Bar */}
            <div className="bg-white/95 backdrop-blur-md px-5 pt-3 pb-2 flex justify-between items-center text-xs font-semibold text-slate-800 border-b border-slate-100 shrink-0 z-30">
              <span>{currentTime}</span>

              {/* Mobile Quick Auth / User status */}
              <div className="flex items-center gap-2">
                {currentUser ? (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    title="Bấm để đăng xuất"
                  >
                    <span>{currentUser.full_name.split(" ").slice(-1)[0]}</span>
                    <LogOut className="w-2.5 h-2.5 text-rose-500" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                  >
                    Đăng nhập
                  </button>
                )}

                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  <BatteryCharging className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{trustBattery}%</span>
                </div>
              </div>
            </div>

            {/* Scrollable Content Inside Phone */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 scrollbar-none">
              {children}
            </div>

            {/* Phone Bottom 4-Tabs Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-3 py-2 flex justify-around items-center z-40">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "text-indigo-600 font-semibold"
                        : "text-slate-400 hover:text-slate-600 font-normal"
                    }`}
                  >
                    <div className="relative">
                      <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                      {tab.badge && (
                        <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] mt-0.5">{tab.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* iOS Home Bar Indicator */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-300 rounded-full pointer-events-none hidden sm:block" />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: HƯỚNG DẪN DÙNG TRÊN ĐIỆN THOẠI & CÀI ĐẶT PWA        */}
      {/* ========================================================= */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Dùng Sell Time Trên Điện Thoại
                </h3>
                <p className="text-xs text-slate-500">
                  Ứng dụng Web App Responsive chuẩn Mobile-First
                </p>
              </div>
            </div>

            {/* Cách 1: Mở trực tiếp bằng WiFi nội bộ */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-emerald-600" />
                  1. Mở trên điện thoại cùng WiFi:
                </span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Mạng LAN
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Mở Safari / Chrome trên điện thoại của bạn và gõ địa chỉ IP này:
              </p>
              <div className="bg-white border border-slate-300 rounded-xl p-2.5 flex items-center justify-between font-mono text-xs font-bold text-indigo-600">
                <span>http://192.168.1.249:3000</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("http://192.168.1.249:3000");
                    alert("Đã sao chép link mạng LAN!");
                  }}
                  className="text-[11px] font-sans font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md"
                >
                  Sao chép
                </button>
              </div>
            </div>

            {/* Cách 2: Cài đặt PWA ra màn hình chính */}
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-indigo-600" />
                2. Cài đặt thành App (PWA) không cần App Store:
              </span>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                <li>
                  <strong>Trên iPhone (Safari):</strong> Bấm nút <em>Chia sẻ (Share icon)</em> $\to$ Chọn <strong>&quot;Thêm vào MH chính&quot; (Add to Home Screen)</strong>.
                </li>
                <li>
                  <strong>Trên Android (Chrome):</strong> Bấm dấu <em>3 chấm</em> ở góc trên $\to$ Chọn <strong>&quot;Cài đặt ứng dụng&quot;</strong> hoặc <strong>&quot;Thêm vào màn hình chính&quot;</strong>.
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Đã hiểu, đóng hộp thoại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
