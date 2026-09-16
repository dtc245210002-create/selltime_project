"use client";

import React, { useMemo, useState, useEffect } from "react";
import { MobileShell } from "../components/MobileShell";
import { RoleSwitcher } from "../components/RoleSwitcher";
import { TimeSliderWidget } from "../components/TimeSliderWidget";
import { ShiftCard } from "../components/ShiftCard";
import { MyShiftsTab, ShiftAttendanceStatus } from "../components/MyShiftsTab";
import { MessagesTab } from "../components/MessagesTab";
import { ProfileTab } from "../components/ProfileTab";
import { EmployerDashboard } from "../components/EmployerDashboard";
import { EmployerExploreTab } from "../components/EmployerExploreTab";
import { EmployerProfileTab } from "../components/EmployerProfileTab";
import { AuthModal } from "../components/AuthModal";
import { AiCoachModal } from "../components/AiCoachModal";
import { CheckinModal } from "../components/CheckinModal";
import { CheckoutModal } from "../components/CheckoutModal";
import {
  DEFAULT_FILTER_CRITERIA,
  INITIAL_SHIFTS,
  MOCK_CANDIDATE_PROFILE,
  MOCK_CANDIDATE_USER,
  MOCK_EMPLOYER_PROFILE,
  MOCK_EMPLOYER_USER,
} from "../application/store";
import { rankShiftsForCandidate } from "../domain/matching-engine";
import { CandidateFilterCriteria, CandidateProfile, Shift, User as UserType, UserRole } from "../domain/types";
import { Sparkles, Info, Bot } from "lucide-react";
import { ViewModeProvider, useViewMode } from "../components/ViewModeContext";

export default function Home() {
  return (
    <ViewModeProvider>
      <HomeContent />
    </ViewModeProvider>
  );
}

function HomeContent() {
  const { isMobile, viewMode } = useViewMode();
  // Quản lý phiên đăng nhập (Session)
  const [currentUser, setCurrentUser] = useState<UserType | null>(MOCK_CANDIDATE_USER);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAiCoachOpen, setIsAiCoachOpen] = useState(false);

  // Quản lý hồ sơ ứng viên (Immutable State)
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>({
    ...MOCK_CANDIDATE_PROFILE,
  });

  // State quản lý Checkin và Checkout Escrow
  const [checkinShift, setCheckinShift] = useState<Shift | null>(null);
  const [checkoutShift, setCheckoutShift] = useState<Shift | null>(null);
  const [shiftStatuses, setShiftStatuses] = useState<Record<string, ShiftAttendanceStatus>>({
    shift_sos_01: "APPLIED",
  });
  const [walletBalance, setWalletBalance] = useState<number>(350000);

  // State vai trò hiện tại (Đồng bộ theo role của currentUser)
  const [currentRole, setCurrentRole] = useState<UserRole>("CANDIDATE");
  const [activeTab, setActiveTab] = useState("explore");

  // State bộ lọc Time-First Core
  const [criteria, setCriteria] = useState<CandidateFilterCriteria>(
    DEFAULT_FILTER_CRITERIA
  );

  // Danh sách ca làm việc (khởi tạo từ mock, đồng bộ với API /api/shifts)
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);

  // Nạp danh sách ca từ API nếu có kết nối
  useEffect(() => {
    fetch("/api/shifts")
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setShifts(json.data);
        }
      })
      .catch((err) => console.warn("Dùng danh sách ca dự phòng:", err));
  }, []);

  // Quản lý ứng tuyển (mặc định cho Huy đã ứng tuyển ca SOS của Chị Lan để demo nhanh)
  const [appliedShiftIds, setAppliedShiftIds] = useState<string[]>(["shift_sos_01"]);

  // Khi chuyển vai trò qua RoleSwitcher
  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === "CANDIDATE") {
      setCurrentUser(MOCK_CANDIDATE_USER);
    } else {
      setCurrentUser(MOCK_EMPLOYER_USER);
    }
  };

  // Đăng nhập thành công từ AuthModal
  const handleLoginSuccess = (user: UserType) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
  };

  // Đăng xuất
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Tính toán Matching Engine đa biến thời gian thực dựa trên candidateProfile state
  const rankedShifts = useMemo(() => {
    return rankShiftsForCandidate(shifts, candidateProfile, criteria);
  }, [shifts, candidateProfile, criteria]);

  // Xử lý nộp đơn 1-chạm (Bắt buộc đăng nhập)
  const handleApply = (shiftId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!appliedShiftIds.includes(shiftId)) {
      setAppliedShiftIds((prev) => [...prev, shiftId]);
      setShiftStatuses((prev) => ({ ...prev, [shiftId]: "APPLIED" }));
    }
  };

  // Xử lý chủ quán đăng ca mới: lưu local và gọi API backend
  const handlePostNewShift = async (newShift: Shift) => {
    setShifts((prev) => [newShift, ...prev]);
    try {
      await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shift: newShift }),
      });
    } catch (e) {
      console.warn("Không thể đồng bộ ca làm với backend API:", e);
    }
  };

  // Xử lý Check-in thành công
  const handleCheckinSuccess = (shiftId: string) => {
    setShiftStatuses((prev) => ({
      ...prev,
      [shiftId]: "IN_PROGRESS",
    }));
  };

  // Xử lý Checkout và giải ngân Escrow thành công (cập nhật state an toàn)
  const handleConfirmCheckout = (shiftId: string, earnedAmount: number) => {
    setShiftStatuses((prev) => ({
      ...prev,
      [shiftId]: "COMPLETED",
    }));
    setWalletBalance((prev) => prev + earnedAmount);
    setCandidateProfile((prev) => ({
      ...prev,
      trust_battery: Math.min(100, prev.trust_battery + 2),
    }));
  };

  // Cập nhật kỹ năng từ AI Coach vào candidateProfile state
  const handleUpdateCandidateSkills = (newSkills: string[]) => {
    setCandidateProfile((prev) => ({
      ...prev,
      skills: [...new Set([...prev.skills, ...newSkills])],
    }));
  };

  // Ca làm việc đã ứng tuyển
  const appliedShiftsList = useMemo(() => {
    return shifts.filter((s) => appliedShiftIds.includes(s.id));
  }, [shifts, appliedShiftIds]);

  return (
    <>
      <MobileShell
        activeTab={activeTab}
        onTabChange={setActiveTab}
        trustBattery={candidateProfile.trust_battery}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      >
        {/* Thanh chuyển đổi nhanh vai trò (Huy SV vs Lan Cafe) */}
        <RoleSwitcher
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          candidateName={MOCK_CANDIDATE_USER.full_name}
          employerName={MOCK_EMPLOYER_PROFILE.company_name}
        />

        {/* NỘI DUNG VAI TRÒ CHỦ QUÁN (EMPLOYER) THEO 4 TAB */}
        {currentRole === "EMPLOYER" ? (
          <>
            {activeTab === "explore" && (
              <div className="max-w-3xl mx-auto w-full">
                <EmployerExploreTab />
              </div>
            )}

            {activeTab === "my-shifts" && (
              <div className="max-w-4xl mx-auto w-full">
                <EmployerDashboard
                  shifts={shifts.filter(
                    (s) => s.employer_id === MOCK_EMPLOYER_USER.id
                  )}
                  appliedCandidateIds={appliedShiftIds}
                  candidateUser={MOCK_CANDIDATE_USER}
                  onPostNewShift={handlePostNewShift}
                  onNavigateToMessages={() => setActiveTab("messages")}
                />
              </div>
            )}

            {activeTab === "messages" && (
              <div className={`w-full ${isMobile ? "h-[640px]" : "h-[750px] max-w-7xl mx-auto"}`}>
                <MessagesTab
                  currentUser={currentUser || MOCK_EMPLOYER_USER}
                  currentRole={currentRole}
                />
              </div>
            )}

            {activeTab === "profile" && (
              <div className="max-w-2xl mx-auto w-full">
                <EmployerProfileTab
                  user={currentUser || MOCK_EMPLOYER_USER}
                  profile={MOCK_EMPLOYER_PROFILE}
                />
              </div>
            )}
          </>
        ) : (
          /* NỘI DUNG VAI TRÒ SINH VIÊN (CANDIDATE) THEO 4 TAB */
          <>
            {activeTab === "explore" && (
              <div className={`flex ${viewMode === "mobile" ? "flex-col p-3 gap-3" : "flex-col lg:flex-row gap-5 p-4 sm:p-5"}`}>
                {/* CỘT TRÁI: Widget Lọc Thời Gian Rảnh (Time-First Search Core) */}
                <div className={`w-full ${viewMode === "mobile" ? "" : "lg:w-[360px] shrink-0"}`}>
                  <div className={`${viewMode === "mobile" ? "" : "sticky top-20"} rounded-xl overflow-hidden`}>
                    <TimeSliderWidget
                      criteria={criteria}
                      onChange={setCriteria}
                      matchCount={rankedShifts.length}
                    />
                  </div>

                  {/* Chỉ dẫn cuộn nhanh xuống danh sách ca cho màn hình hẹp */}
                  <div className="pt-2 lg:hidden">
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById("shifts-feed-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-medium flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>Xem {rankedShifts.length} ca làm việc phù hợp</span>
                      </span>
                      <span className="text-[11px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-mono">
                        Xem ngay ↓
                      </span>
                    </button>
                  </div>
                </div>

                {/* CỘT PHẢI: Feed Danh Sách Ca Làm Khớp Nối Đa Biến */}
                <div id="shifts-feed-section" className="flex-1 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        Việc Làm Phù Hợp ({rankedShifts.length})
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsAiCoachOpen(true)}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                      >
                        <Bot className="w-3.5 h-3.5 text-purple-400" />
                        <span>Trợ lý Phỏng Vấn & CV</span>
                      </button>
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        Sắp xếp theo Matching Score
                      </span>
                    </div>
                  </div>

                  {/* Grid thẻ việc làm (1 cột trên mobile, 2 cột trên máy tính) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {rankedShifts.map((shiftWithMatch) => (
                      <ShiftCard
                        key={shiftWithMatch.id}
                        shiftWithMatch={shiftWithMatch}
                        onApply={handleApply}
                        isApplied={appliedShiftIds.includes(shiftWithMatch.id)}
                      />
                    ))}
                  </div>

                  {/* Footer thông tin thuật toán */}
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5 mt-2">
                    <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>
                      Matching Engine 4 biến:{" "}
                      <strong className="text-slate-200">Thời gian (35%)</strong>,{" "}
                      <strong className="text-slate-200">Vị trí (25%)</strong>,{" "}
                      <strong className="text-slate-200">Kỹ năng (25%)</strong>,{" "}
                      <strong className="text-slate-200">Mức lương (15%)</strong>.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "my-shifts" && (
              <div className="max-w-2xl mx-auto w-full">
                <MyShiftsTab
                  appliedShifts={appliedShiftsList}
                  shiftStatuses={shiftStatuses}
                  onStartCheckin={(s) => setCheckinShift(s)}
                  onStartCheckout={(s) => setCheckoutShift(s)}
                />
              </div>
            )}

            {activeTab === "messages" && (
              <div className={`w-full ${isMobile ? "h-[640px]" : "h-[750px] max-w-7xl mx-auto"}`}>
                <MessagesTab
                  currentUser={currentUser || MOCK_CANDIDATE_USER}
                  currentRole={currentRole}
                />
              </div>
            )}

            {activeTab === "profile" && (
              <div className="max-w-2xl mx-auto w-full">
                <ProfileTab
                  user={currentUser || MOCK_CANDIDATE_USER}
                  profile={candidateProfile}
                  walletBalance={walletBalance}
                  onWithdrawFunds={(amt) => setWalletBalance(0)}
                />
              </div>
            )}
          </>
        )}
      </MobileShell>

      {/* MODAL AUTH ĐĂNG NHẬP / ĐĂNG KÝ */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* MODAL TRỢ LÝ AI: PHỎNG VẤN STAR & TỐI ƯU CV */}
      <AiCoachModal
        isOpen={isAiCoachOpen}
        onClose={() => setIsAiCoachOpen(false)}
        candidateSkills={candidateProfile.skills}
        onUpdateSkills={handleUpdateCandidateSkills}
      />

      {/* MODAL CHECK-IN GPS GEOFENCING & QR CODE KÈM PIN FALLBACK */}
      <CheckinModal
        isOpen={!!checkinShift}
        onClose={() => setCheckinShift(null)}
        shift={checkinShift}
        onCheckinSuccess={handleCheckinSuccess}
      />

      {/* MODAL CHECKOUT HOÀN THÀNH CA & GIẢI NGÂN ESCROW */}
      <CheckoutModal
        isOpen={!!checkoutShift}
        onClose={() => setCheckoutShift(null)}
        shift={checkoutShift}
        onConfirmCheckout={handleConfirmCheckout}
      />
    </>
  );
}
