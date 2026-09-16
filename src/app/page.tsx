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

export default function Home() {
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
              <div className="w-full h-[700px] lg:h-[800px]">
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
              <div className="flex flex-col lg:flex-row gap-6 p-0 lg:p-6">
                {/* CỘT TRÁI: Widget Lọc Thời Gian Rảnh (Time-First Search Core) */}
                <div className="w-full lg:w-[380px] shrink-0">
                  <div className="lg:sticky lg:top-24 rounded-none lg:rounded-3xl overflow-hidden shadow-sm">
                    <TimeSliderWidget
                      criteria={criteria}
                      onChange={setCriteria}
                      matchCount={rankedShifts.length}
                    />
                  </div>
                </div>

                {/* CỘT PHẢI: Feed Danh Sách Ca Làm Khớp Nối Đa Biến */}
                <div className="flex-1 p-4 lg:p-0 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                        Gợi ý ca làm phù hợp ({rankedShifts.length})
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsAiCoachOpen(true)}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm shadow-purple-500/20 transition-all active:scale-95"
                      >
                        <Bot className="w-4 h-4" />
                        <span>Luyện Phỏng Vấn STAR & CV AI</span>
                      </button>
                      <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                        Sắp xếp theo Matching Score
                      </span>
                    </div>
                  </div>

                  {/* Grid thẻ việc làm (1 cột trên mobile, 2 cột trên máy tính) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/60 text-xs text-slate-600 flex items-start gap-2.5 mt-4">
                    <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      Điểm số Matching được tính toán tự động và liên tục từ 4 biến:{" "}
                      <strong className="text-indigo-900">Thời gian (35%)</strong>,{" "}
                      <strong className="text-emerald-900">Vị trí (25%)</strong>,{" "}
                      <strong className="text-purple-900">Kỹ năng (25%)</strong> và{" "}
                      <strong className="text-amber-900">Mức lương (15%)</strong> theo tiêu chuẩn PRD FR-6.
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
              <div className="w-full h-[700px] lg:h-[800px]">
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
