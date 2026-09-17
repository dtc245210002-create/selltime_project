"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Compass,
  CalendarCheck2,
  MessageSquare,
  UserCheck,
  BatteryCharging,
  Wifi,
  Smartphone,
  Monitor,
  Download,
  X,
  LogIn,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { User as UserType } from "../domain/types";
import { useViewMode } from "./ViewModeContext";

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
  const { viewMode, setViewMode, theme, toggleTheme } = useViewMode();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const phoneScrollRef = useRef<HTMLDivElement>(null);

  // Reset phone container scroll cleanly when changing tabs
  useEffect(() => {
    if (phoneScrollRef.current) {
      phoneScrollRef.current.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [activeTab]);

  const tabs = [
    { id: "explore", label: "Khám phá", icon: Compass },
    { id: "my-shifts", label: "Ca của tôi", icon: CalendarCheck2 },
    { id: "messages", label: "Tin nhắn", icon: MessageSquare, badge: 2 },
    { id: "profile", label: "Cá nhân", icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-900 selection:text-purple-200">
      {/* ========================================================= */}
      {/* TOP HEADER: Clean Bar with Theme & Mode Controls          */}
      {/* ========================================================= */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 shrink-0 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Brand Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white text-sm tracking-tight shadow-sm">
              ST
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm text-white tracking-tight">
                  Sell Time
                </h1>
                <span className="text-[10px] font-medium text-purple-400 bg-purple-950/80 border border-purple-800/60 px-1.5 py-0.2 rounded-md">
                  Time-First
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Thị trường kết nối việc làm theo giờ linh hoạt
              </p>
            </div>
          </div>

          {/* Controls: Theme toggle, View mode switcher, PWA & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center shadow-sm"
              title={theme === "dark" ? "Chuyển sang Giao diện Sáng (Light Mode)" : "Chuyển sang Giao diện Tối (Dark Mode)"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-purple-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* View Mode Switcher (Web / Mobile) */}
            <div className="bg-slate-950 p-1 rounded-lg flex items-center border border-slate-800">
              <button
                onClick={() => setViewMode("desktop")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === "desktop"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Xem trước chế độ Web màn hình rộng"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Xem trước Web</span>
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === "mobile"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Xem trước chế độ ứng dụng di động"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Xem trước Mobile</span>
              </button>
            </div>

            {/* PWA Button */}
            <button
              onClick={() => setShowInstallModal(true)}
              className="hidden sm:flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Cài App</span>
            </button>

            {/* Auth Session Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="flex items-center gap-2">
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-7 h-7 rounded-md object-cover border border-slate-700"
                  />
                  <div className="hidden lg:block text-left">
                    <span className="text-xs font-semibold text-white block leading-none">
                      {currentUser.full_name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {currentUser.role === "CANDIDATE" ? "Sinh viên" : "Chủ quán"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 1. DESKTOP MODE                                           */}
      {/* ========================================================= */}
      {viewMode === "desktop" ? (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col">
          {/* Navigation Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-flat">
            <nav className="flex items-center gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-purple-950/70 text-purple-300 border border-purple-800/70"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Trust Badge & Location */}
            <div className="flex items-center gap-3 pr-2">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 text-emerald-400 px-3 py-1 rounded-lg text-xs font-medium">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pin uy tín: {trustBattery}%</span>
              </div>
              <span className="text-xs text-slate-500 hidden md:inline">
                TP. Thái Nguyên • ĐH TNUT
              </span>
            </div>
          </div>

          {/* Desktop Content Surface */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-card">
            {children}
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* 2. MOBILE PREVIEW SMARTPHONE FRAME (420px)                */
        /* ========================================================= */
        <div className="flex-1 flex justify-center items-center py-6 bg-slate-950">
          <div className="w-full sm:max-w-[420px] h-[820px] bg-slate-950 sm:rounded-2xl sm:border border-slate-800 sm:shadow-modal flex flex-col overflow-hidden relative">
            {/* Status Bar */}
            <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 flex justify-between items-center text-xs font-medium text-slate-400 border-b border-slate-800 shrink-0 z-30">
              <span className="font-mono">{currentTime}</span>

              <div className="flex items-center gap-2">
                {currentUser ? (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1 text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 hover:text-rose-400"
                    title="Đăng xuất"
                  >
                    <span>{currentUser.full_name.split(" ").slice(-1)[0]}</span>
                    <LogOut className="w-2.5 h-2.5 text-slate-400" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="bg-purple-600 text-white text-[10px] font-medium px-2.5 py-0.5 rounded-md"
                  >
                    Đăng nhập
                  </button>
                )}

                <div className="flex items-center gap-1 text-emerald-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                  <BatteryCharging className="w-3 h-3" />
                  <span className="text-[10px] font-mono">{trustBattery}%</span>
                </div>
              </div>
            </div>

            {/* Scrollable Content inside phone */}
            <div ref={phoneScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden pb-16 scrollbar-none bg-slate-950">
              {children}
            </div>

            {/* Bottom 4-Tabs Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex justify-around items-center z-40">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative flex flex-col items-center py-1 px-3 rounded-md transition-colors ${
                      isActive
                        ? "text-purple-400 font-medium"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <div className="relative">
                      <Icon className="w-5 h-5" />
                      {tab.badge && (
                        <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] mt-0.5">{tab.label}</span>
                    {isActive && (
                      <span className="w-1 h-1 bg-purple-500 rounded-full mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PWA INSTALL MODAL                                         */}
      {/* ========================================================= */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-slate-900 w-full max-w-md rounded-xl p-5 border border-slate-800 shadow-modal space-y-4 relative">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-purple-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Dùng Sell Time Trên Điện Thoại
                </h3>
                <p className="text-xs text-slate-400">
                  Web App chuẩn Mobile-First, không cần cài đặt qua Store
                </p>
              </div>
            </div>

            {/* LAN WiFi */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  Mở trên điện thoại cùng mạng WiFi:
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-md p-2 flex items-center justify-between font-mono text-xs text-purple-300">
                <span className="truncate mr-2">
                  {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}
                </span>
                <button
                  onClick={() => {
                    const url = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
                    navigator.clipboard.writeText(url);
                    alert("Đã sao chép liên kết: " + url);
                  }}
                  className="text-[11px] font-sans font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded-md shrink-0"
                >
                  Sao chép
                </button>
              </div>
            </div>

            {/* PWA Home screen */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5 text-xs text-slate-300">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-purple-400" />
                Thêm vào màn hình chính (PWA):
              </span>
              <ul className="space-y-1 list-disc pl-4 text-slate-400 text-[11px]">
                <li><strong>iPhone (Safari):</strong> Bấm nút <em>Chia sẻ</em> → Chọn <strong>Thêm vào MH chính</strong>.</li>
                <li><strong>Android (Chrome):</strong> Bấm <em>3 chấm</em> → Chọn <strong>Cài đặt ứng dụng</strong>.</li>
              </ul>
            </div>

            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-md transition-colors"
            >
              Đã hiểu, đóng hộp thoại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
