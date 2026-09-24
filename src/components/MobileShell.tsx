"use client";

import React, { useState } from "react";
import {
  Compass,
  CalendarCheck2,
  MessageSquare,
  UserCheck,
  BatteryCharging,
  Wifi,
  Smartphone,
  Download,
  X,
  LogIn,
  LogOut,
  Sun,
  Moon,
  BookOpen,
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
  onOpenGuide?: () => void;
}

export function MobileShell({
  children,
  activeTab,
  onTabChange,
  trustBattery = 100,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenGuide,
}: MobileShellProps) {
  const { theme, toggleTheme } = useViewMode();
  const [showInstallModal, setShowInstallModal] = useState(false);

  const tabs = [
    { id: "explore", label: "Khám phá", icon: Compass },
    { id: "my-shifts", label: "Ca của tôi", icon: CalendarCheck2 },
    { id: "messages", label: "Tin nhắn", icon: MessageSquare, badge: 2 },
    { id: "profile", label: "Cá nhân", icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-900 selection:text-purple-200 pb-16 md:pb-0">
      {/* ========================================================= */}
      {/* TOP HEADER: Clean Responsive Navbar                       */}
      {/* ========================================================= */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-5 lg:px-8 py-2.5 shrink-0 sticky top-0 z-50">
        <div className="max-w-[1720px] w-full mx-auto flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white p-0.5 border border-slate-700 shadow-md flex items-center justify-center shrink-0 hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="SellTime Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight flex items-center">
                  <span className="text-teal-400">Sell</span>
                  <span className="text-rose-400">Time</span>
                </h1>
                <span className="text-[10px] font-semibold text-teal-300 bg-teal-950/80 border border-teal-800/60 px-1.5 py-0.2 rounded-md">
                  Time-First
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                Bạn có bao nhiêu thời gian để bán?
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl shadow-xs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Controls: Guide, Theme, Trust Battery, PWA & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Nút Hướng Dẫn & Cẩm Nang Kỹ Năng */}
            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                className="flex items-center gap-1.5 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/60 text-purple-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                title="Xem hướng dẫn sử dụng và cẩm nang kỹ năng F&B"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Hướng Dẫn & Kỹ Năng</span>
              </button>
            )}

            {/* Theme Toggle */}
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

            {/* Pin Uy Tín */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-medium">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono font-bold text-[11px]">{trustBattery}%</span>
            </div>

            {/* PWA Button */}
            <button
              onClick={() => setShowInstallModal(true)}
              className="hidden sm:flex items-center gap-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
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
                      {currentUser.role === "CANDIDATE" ? "Sinh viên TNUT" : "Chủ quán"}
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
      {/* MAIN CONTENT CONTAINER (FULL RESPONSIVE WEB APP)         */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-2 sm:p-3 md:p-4 flex flex-col">
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-card">
          {children}
        </div>
      </main>

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (ONLY ON MOBILE SCREENS)     */}
      {/* ========================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex justify-around items-center z-50">
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
      </nav>

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
