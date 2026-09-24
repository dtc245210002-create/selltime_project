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
import { CancelShiftModal } from "../components/CancelShiftModal";
import { GuideModal } from "../components/GuideModal";
import { LoginRequiredCard } from "../components/LoginRequiredCard";
import {
  DEFAULT_FILTER_CRITERIA,
  INITIAL_SHIFTS,
  MOCK_CANDIDATE_PROFILE,
  MOCK_CANDIDATE_USER,
  MOCK_EMPLOYER_PROFILE,
  MOCK_EMPLOYER_USER,
} from "../application/store";
import { rankShiftsForCandidate } from "../domain/matching-engine";
import { PenaltyResult } from "../domain/trust-battery";
import { CandidateFilterCriteria, CandidateProfile, EmployerProfile, Shift, User as UserType, UserRole } from "../domain/types";
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
  // Quản lý phiên đăng nhập: Mặc định đăng nhập sẵn Nguyễn Đức Huy (Sinh viên TNUT)
  const [currentUser, setCurrentUser] = useState<UserType | null>(MOCK_CANDIDATE_USER);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAiCoachOpen, setIsAiCoachOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Quản lý hồ sơ ứng viên (Immutable State)
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>({
    ...MOCK_CANDIDATE_PROFILE,
  });

  // Quản lý hồ sơ nhà tuyển dụng (Mutable State)
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile>({
    ...MOCK_EMPLOYER_PROFILE,
  });

  // State quản lý Checkin và Checkout Escrow
  const [checkinShift, setCheckinShift] = useState<Shift | null>(null);
  const [checkoutShift, setCheckoutShift] = useState<Shift | null>(null);
  const [shiftStatuses, setShiftStatuses] = useState<Record<string, ShiftAttendanceStatus>>({
    shift_sos_01: "APPLIED",
  });
  const [walletBalance, setWalletBalance] = useState<number>(350000);

  // State vai trò hiện tại (Mặc định là CANDIDATE)
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

  // Quản lý ứng tuyển
  const [appliedShiftIds, setAppliedShiftIds] = useState<string[]>(["shift_sos_01"]);
  const [appliedTimestamps, setAppliedTimestamps] = useState<Record<string, number>>({
    shift_sos_01: Date.now(),
  });
  const [cancelTargetShift, setCancelTargetShift] = useState<Shift | null>(null);

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
    if (user.role === "CANDIDATE" && appliedShiftIds.length === 0) {
      setAppliedShiftIds(["shift_sos_01"]);
      setShiftStatuses({ shift_sos_01: "APPLIED" });
      setAppliedTimestamps({ shift_sos_01: Date.now() });
    }
  };

  // Đăng xuất
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Tính toán Matching Engine đa biến thời gian thực dựa trên candidateProfile state
  const rankedShifts = useMemo(() => {
    return rankShiftsForCandidate(shifts, candidateProfile, criteria);
  }, [shifts, candidateProfile, criteria]);

  // Xử lý nộp đơn 1-chạm (Nếu chưa đăng nhập -> Hiển thị Modal Đăng nhập)
  const handleApply = (shiftId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!appliedShiftIds.includes(shiftId)) {
      setAppliedShiftIds((prev) => [...prev, shiftId]);
      setShiftStatuses((prev) => ({ ...prev, [shiftId]: "APPLIED" }));
      setAppliedTimestamps((prev) => ({ ...prev, [shiftId]: Date.now() }));
    }
  };

  // Xử lý hủy ca làm việc (Ân hạn 1 giờ do ấn nhầm)
  const handleConfirmCancelShift = (shiftId: string, penalty: PenaltyResult, reason: string) => {
    setAppliedShiftIds((prev) => prev.filter((id) => id !== shiftId));
    setShiftStatuses((prev) => {
      const updated = { ...prev };
      delete updated[shiftId];
      return updated;
    });

    // Trừ điểm Pin uy tín nếu vượt quá thời gian ân hạn
    if (penalty.penaltyPoints > 0) {
      setCandidateProfile((prev) => ({
        ...prev,
        trust_battery: Math.max(0, prev.trust_battery - penalty.penaltyPoints),
      }));
    }
    setCancelTargetShift(null);
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

  // Cập nhật hồ sơ sinh viên
  const handleUpdateCandidateProfile = (updated: CandidateProfile) => {
    setCandidateProfile(updated);
  };

  const handleUpdateCandidateUser = (updated: Partial<UserType>) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  // Cập nhật hồ sơ chủ quán
  const handleUpdateEmployerProfile = (updated: EmployerProfile) => {
    setEmployerProfile(updated);
    setShifts((prev) =>
      prev.map((s) =>
        s.employer_id === (currentUser?.id || MOCK_EMPLOYER_USER.id)
          ? { ...s, employer_name: updated.company_name }
          : s
      )
    );
  };

  const handleUpdateEmployerUser = (updated: Partial<UserType>) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null));
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
        onOpenGuide={() => setIsGuideOpen(true)}
      >
        {/* Thanh chuyển đổi nhanh vai trò (Huy SV vs Lan Cafe) */}
        <RoleSwitcher
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          candidateName={currentUser && currentUser.role === "CANDIDATE" ? currentUser.full_name : MOCK_CANDIDATE_USER.full_name}
          employerName={employerProfile.company_name}
          isGuest={!currentUser}
        />

        {/* NỘI DUNG VAI TRÒ CHỦ QUÁN (EMPLOYER) THEO 4 TAB */}
        {currentRole === "EMPLOYER" ? (
          <>
            {activeTab === "explore" && (
              <div className="max-w-5xl mx-auto w-full">
                <EmployerExploreTab />
              </div>
            )}

            {activeTab === "my-shifts" && (
              <div className="max-w-5xl mx-auto w-full">
                {currentUser ? (
                  <EmployerDashboard
                    shifts={shifts.filter(
                      (s) => s.employer_id === (currentUser?.id || MOCK_EMPLOYER_USER.id)
                    )}
                    appliedCandidateIds={appliedShiftIds}
                    candidateUser={MOCK_CANDIDATE_USER}
                    onPostNewShift={handlePostNewShift}
                    onNavigateToMessages={() => setActiveTab("messages")}
                  />
                ) : (
                  <LoginRequiredCard
                    title="Cổng Tuyển Dụng Dành Cho Chủ Quán"
                    description="Đăng nhập để đăng ca làm linh hoạt/SOS, duyệt ứng viên sinh viên và giải ngân quỹ Escrow."
                    features={[
                      "Đăng ca khẩn cấp SOS thưởng nóng thu hút ứng viên",
                      "Duyệt ứng viên 1-chạm & Ký quỹ an toàn VietQR",
                      "Theo dõi điểm danh GPS 100m & Giờ làm việc thực tế",
                    ]}
                    roleHint="EMPLOYER"
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                  />
                )}
              </div>
            )}

            {activeTab === "messages" && (
              <div className="w-full h-[750px] max-w-[1600px] mx-auto">
                {currentUser ? (
                  <MessagesTab
                    currentUser={currentUser}
                    currentRole={currentRole}
                  />
                ) : (
                  <LoginRequiredCard
                    title="Đăng nhập để Nhắn tin với Ứng viên"
                    description="Trao đổi công việc, hướng dẫn ca làm và chia sẻ vị trí bản đồ trực tiếp với ứng viên."
                    features={[
                      "Nhắn tin trao đổi thời gian thực 2 chiều",
                      "Mẫu tin nhắn trả lời nhanh 1-chạm",
                      "Chỉ đường vị trí quán qua Google Maps",
                    ]}
                    roleHint="EMPLOYER"
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                  />
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="max-w-4xl mx-auto w-full">
                {currentUser ? (
                  <EmployerProfileTab
                    user={currentUser}
                    profile={employerProfile}
                    onUpdateProfile={handleUpdateEmployerProfile}
                    onUpdateUser={handleUpdateEmployerUser}
                  />
                ) : (
                  <LoginRequiredCard
                    title="Hồ Sơ Cơ Sở Kinh Doanh"
                    description="Đăng nhập để quản lý thông tin thương hiệu, vị trí tọa độ GPS và thiết lập mã PIN quầy."
                    features={[
                      "Cập nhật tên & địa chỉ cơ sở kinh doanh",
                      "Huy hiệu xác minh thương hiệu đã kiểm duyệt",
                      "Cài đặt mã PIN điểm danh cho nhân viên",
                    ]}
                    roleHint="EMPLOYER"
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                  />
                )}
              </div>
            )}
          </>
        ) : (
          /* NỘI DUNG VAI TRÒ SINH VIÊN (CANDIDATE) THEO 4 TAB */
          <>
            {activeTab === "explore" && (
              <div className="flex flex-col lg:flex-row gap-5 p-3 sm:p-4 md:p-5">
                {/* CỘT TRÁI: Widget Lọc Thời Gian Rảnh (Time-First Search Core) */}
                <div className="w-full lg:w-[350px] xl:w-[360px] shrink-0">
                  <div className="lg:sticky lg:top-20 rounded-xl overflow-hidden">
                    <TimeSliderWidget
                      criteria={criteria}
                      onChange={setCriteria}
                      matchCount={rankedShifts.length}
                    />
                  </div>
                </div>

                {/* CỘT PHẢI: Feed Danh Sách Ca Làm Khớp Nối Đa Biến */}
                <div id="shifts-feed-section" className="flex-1 space-y-3.5 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        Việc Làm Phù Hợp ({rankedShifts.length})
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            setIsAuthModalOpen(true);
                          } else {
                            setIsAiCoachOpen(true);
                          }
                        }}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors shadow-xs"
                      >
                        <Bot className="w-3.5 h-3.5 text-purple-400" />
                        <span>Trợ lý Phỏng Vấn & CV</span>
                      </button>
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        Sắp xếp theo Matching Score
                      </span>
                    </div>
                  </div>

                  {/* Grid thẻ việc làm (1 cột trên mobile, 2 cột trên tablet/laptop, 3 cột trên màn hình rộng) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                    {rankedShifts.map((shiftWithMatch) => (
                      <ShiftCard
                        key={shiftWithMatch.id}
                        shiftWithMatch={shiftWithMatch}
                        onApply={handleApply}
                        isApplied={appliedShiftIds.includes(shiftWithMatch.id)}
                        candidateSkills={candidateProfile.skills}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "my-shifts" && (
              <div className="max-w-4xl mx-auto w-full p-2 sm:p-4">
                {currentUser ? (
                  <MyShiftsTab
                    appliedShifts={appliedShiftsList}
                    shiftStatuses={shiftStatuses}
                    onStartCheckin={(s) => setCheckinShift(s)}
                    onStartCheckout={(s) => setCheckoutShift(s)}
                    onCancelShift={(s) => setCancelTargetShift(s)}
                  />
                ) : (
                  <LoginRequiredCard
                    title="Đăng nhập để theo dõi Ca làm việc"
                    description="Xem danh sách ca đã ứng tuyển, điểm danh định vị GPS trong bán kính 100m và nhận thù lao ký quỹ VietQR PayOS."
                    features={[
                      "Quản lý ca đã ứng tuyển & trạng thái xét duyệt",
                      "Điểm danh GPS 2 lớp & Mã PIN quầy 8866",
                      "Đồng hồ bấm giờ làm việc & Giải ngân ví tức thì",
                    ]}
                    roleHint="CANDIDATE"
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                  />
                )}
              </div>
            )}

            {activeTab === "messages" && (
              <div className="w-full h-[750px] max-w-[1600px] mx-auto p-2 sm:p-4">
                {currentUser ? (
                  <MessagesTab
                    currentUser={currentUser}
                    currentRole={currentRole}
                  />
                ) : (
                  <LoginRequiredCard
                    title="Đăng nhập để trò chuyện với Chủ quán"
                    description="Nhắn tin trao đổi công việc trực tiếp, nhận hướng dẫn ca làm và chia sẻ vị trí bản đồ."
                    features={[
                      "Tin nhắn tức thì 2 chiều Sinh viên - Chủ quán",
                      "Gợi ý trả lời nhanh 1-chạm tiện lợi",
                      "Xem bản đồ và chỉ đường đến quán qua Google Maps",
                    ]}
                    roleHint="CANDIDATE"
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                  />
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="max-w-4xl mx-auto w-full p-2 sm:p-4">
                {currentUser ? (
                  <ProfileTab
                    user={currentUser}
                    profile={candidateProfile}
                    walletBalance={walletBalance}
                    onWithdrawFunds={(amt) => setWalletBalance(0)}
                    onUpdateProfile={handleUpdateCandidateProfile}
                    onUpdateUser={handleUpdateCandidateUser}
                  />
                ) : (
                  <LoginRequiredCard
                    title="Đăng nhập để xem Hồ sơ & Điểm Pin Uy Tín"
                    description="Tùy chỉnh khung giờ rảnh hàng tuần, kỹ năng làm việc, rút tiền ví thù lao và theo dõi điểm PartyMode."
                    features={[
                      "Ma trận lịch rảnh 7 ngày trong tuần",
                      "Đo lường & Tích lũy Pin Uy Tín PartyMode (0-100%)",
                      "Rút tiền thù lao về tài khoản ngân hàng",
                    ]}
                    roleHint="CANDIDATE"
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                  />
                )}
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

      {/* MODAL HỦY CA LÀM VIỆC (ÂN HẠN 1 GIỜ DO ẤN NHẦM) */}
      <CancelShiftModal
        isOpen={!!cancelTargetShift}
        onClose={() => setCancelTargetShift(null)}
        shift={cancelTargetShift}
        appliedAtTimestamp={
          cancelTargetShift ? appliedTimestamps[cancelTargetShift.id] : undefined
        }
        onConfirmCancel={handleConfirmCancelShift}
      />

      {/* MODAL HƯỚNG DẪN SỬ DỤNG & CẨM NANG KỸ NĂNG NGHỀ */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        defaultRole={currentRole}
      />
    </>
  );
}
