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
import {
  PenaltyResult,
  calculateCompletionReward,
  canAcceptSosShift,
} from "../domain/trust-battery";
import { CandidateFilterCriteria, CandidateProfile, EmployerProfile, Shift, User as UserType, UserRole } from "../domain/types";
import { Sparkles, Info, Bot } from "lucide-react";
import { ViewModeProvider, useViewMode } from "../components/ViewModeContext";

export default function Home() {
  return <HomeContent />;
}

function HomeContent() {
  // Quản lý phiên đăng nhập: Mặc định đăng nhập sẵn Nguyễn Đức Huy (Sinh viên TNUT)
  const [currentUser, setCurrentUser] = useState<UserType | null>(MOCK_CANDIDATE_USER);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
  const [checkinTimestamps, setCheckinTimestamps] = useState<Record<string, number>>({});
  const [walletBalance, setWalletBalance] = useState<number>(350000);
  const [escrowPayoutToast, setEscrowPayoutToast] = useState<{
    open: boolean;
    amount: number;
    shiftTitle: string;
  } | null>(null);

  // State khóa ca SOS do án phạt hủy ca
  const [sosLockUntil, setSosLockUntil] = useState<number | null>(null);
  const [sosLockReason, setSosLockReason] = useState<string | null>(null);

  // State vai trò hiện tại (Mặc định là CANDIDATE)
  const [currentRole, setCurrentRole] = useState<UserRole>("CANDIDATE");
  const [activeTab, setActiveTab] = useState("explore");

  // State bộ lọc Time-First Core
  const [criteria, setCriteria] = useState<CandidateFilterCriteria>(
    DEFAULT_FILTER_CRITERIA
  );

  // Danh sách ca DEMO: dữ liệu mẫu và ca mới chỉ ở local
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);

  // Quản lý ứng tuyển
  const [appliedShiftIds, setAppliedShiftIds] = useState<string[]>(["shift_sos_01"]);
  const [appliedTimestamps, setAppliedTimestamps] = useState<Record<string, number>>({
    shift_sos_01: Date.now(),
  });
  const [cancelTargetShift, setCancelTargetShift] = useState<Shift | null>(null);

  // Khôi phục trạng thái ca làm & khóa SOS từ localStorage (chỉ áp dụng phiên demo client)
  useEffect(() => {
    try {
      const savedStatuses = localStorage.getItem("selltime_demo_shift_statuses");
      const savedTimestamps = localStorage.getItem("selltime_demo_checkin_timestamps");
      const savedLock = localStorage.getItem("selltime_demo_sos_lock");
      const savedApplied = localStorage.getItem("selltime_demo_applied_ids");

      if (savedStatuses) setShiftStatuses(JSON.parse(savedStatuses));
      if (savedTimestamps) setCheckinTimestamps(JSON.parse(savedTimestamps));
      if (savedApplied) setAppliedShiftIds(JSON.parse(savedApplied));
      const savedWallet = localStorage.getItem("selltime_wallet_balance");
      if (savedWallet && !isNaN(Number(savedWallet))) {
        setWalletBalance(Number(savedWallet));
      }
      if (savedLock) {
        const parsedLock = JSON.parse(savedLock);
        if (parsedLock.until && Date.now() < parsedLock.until) {
          setSosLockUntil(parsedLock.until);
          setSosLockReason(parsedLock.reason || null);
        } else {
          localStorage.removeItem("selltime_demo_sos_lock");
        }
      }
    } catch (e) {
      console.warn("Không thể khôi phục phiên demo từ localStorage:", e);
    }

    // Kiểm tra nếu có session thật từ Supabase Auth
    async function checkRealSession() {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin" });
        if (res.ok) {
          const data = await res.json();
          if (data?.identity) {
            setCurrentUser({
              id: data.identity.userId,
              email: data.identity.email,
              phone: "0988888888",
              full_name: data.identity.fullName || "Ứng Viên",
              role: data.identity.role as UserRole,
              avatar_url: data.identity.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
              is_kyc_verified: true,
              created_at: new Date().toISOString(),
            });
            // Nạp thêm các ca làm việc thật từ Supabase Cloud
            try {
              const shiftsRes = await fetch("/api/shifts", { cache: "no-store", credentials: "same-origin" });
              if (shiftsRes.ok) {
                const shiftsJson = await shiftsRes.json();
                if (shiftsJson?.data && Array.isArray(shiftsJson.data) && shiftsJson.data.length > 0) {
                  setShifts((prev) => {
                    const existingIds = new Set(prev.map((s) => s.id));
                    const cloudShifts = (shiftsJson.data as Shift[]).filter((s) => !existingIds.has(s.id));
                    return [...cloudShifts, ...prev];
                  });
                }
              }
            } catch (_) {}
          }
        }
      } catch (_) {
        // Fallback demo persona
      }
    }
    void checkRealSession();
  }, []);

  // Đồng bộ trạng thái vào localStorage khi có thay đổi
  useEffect(() => {
    try {
      localStorage.setItem("selltime_demo_shift_statuses", JSON.stringify(shiftStatuses));
      localStorage.setItem("selltime_demo_checkin_timestamps", JSON.stringify(checkinTimestamps));
      localStorage.setItem("selltime_demo_applied_ids", JSON.stringify(appliedShiftIds));
      if (sosLockUntil && Date.now() < sosLockUntil) {
        localStorage.setItem("selltime_demo_sos_lock", JSON.stringify({ until: sosLockUntil, reason: sosLockReason }));
      } else {
        localStorage.removeItem("selltime_demo_sos_lock");
      }
    } catch (_) {}
  }, [shiftStatuses, checkinTimestamps, appliedShiftIds, sosLockUntil, sosLockReason]);

  // DEMO uses sample shifts and local additions; it does not read live records.

  // Khi chuyển vai trò qua RoleSwitcher
  const handleRoleChange = (newRole: UserRole) => {
    if (newRole !== "CANDIDATE" && newRole !== "EMPLOYER") return;
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
    void fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      credentials: "same-origin",
    }).catch(() => {});
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

    const targetShift = shifts.find((s) => s.id === shiftId);
    if (targetShift && targetShift.is_sos) {
      // 1. Kiểm tra điều kiện Pin Uy Tín >= 80% theo quy tắc domain
      if (!canAcceptSosShift(candidateProfile.trust_battery)) {
        alert(
          `Bạn không thể nhận ca SOS khẩn cấp vì Pin Uy Tín hiện tại (${candidateProfile.trust_battery}%) thấp hơn mức tối thiểu 80%. Hãy hoàn thành thêm ca thường để tích lũy Pin Uy Tín.`
        );
        return;
      }
      // 2. Kiểm tra nếu đang bị tạm khóa nhận ca SOS do án phạt hủy ca
      if (sosLockUntil && Date.now() < sosLockUntil) {
        const remainingHours = Math.max(1, Math.ceil((sosLockUntil - Date.now()) / (3600 * 1000)));
        alert(
          `Tài khoản đang bị tạm khóa nhận ca SOS (còn khoảng ${remainingHours} giờ).\nLý do: ${sosLockReason || "Vi phạm quy chế hủy ca khẩn cấp"}.`
        );
        return;
      }
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
    setCheckinTimestamps((prev) => {
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

    // Áp dụng cờ khóa nhận ca SOS theo đúng lockHours từ domain
    if (penalty.isLockedFromSos && penalty.lockHours > 0) {
      const lockUntil = Date.now() + penalty.lockHours * 3600 * 1000;
      setSosLockUntil(lockUntil);
      setSosLockReason(penalty.reason);
    }

    setCancelTargetShift(null);
  };

  // Đăng ca mới: cập nhật ngay vào giao diện, nếu có tài khoản thật thì đồng bộ lên Cloud
  const handlePostNewShift = async (newShift: Shift) => {
    setShifts((prev) => [newShift, ...prev]);
    if (currentUser && currentUser.role === "EMPLOYER" && !currentUser.id.startsWith("demo_") && !currentUser.id.startsWith("user_emp_lan")) {
      try {
        await fetch("/api/shifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shift: newShift }),
          cache: "no-store",
          credentials: "same-origin",
        });
      } catch (err) {
        console.warn("Không thể đồng bộ ca làm lên Supabase Cloud:", err);
      }
    }
  };

  // Xử lý Check-in thành công
  const handleCheckinSuccess = (shiftId: string) => {
    const now = Date.now();
    setShiftStatuses((prev) => ({
      ...prev,
      [shiftId]: "IN_PROGRESS",
    }));
    setCheckinTimestamps((prev) => ({
      ...prev,
      [shiftId]: prev[shiftId] || now,
    }));
  };

  // Xử lý Checkout và tự động giải ngân Escrow thành công
  const handleConfirmCheckout = (shift: Shift, earnedAmount: number, rating: number = 5) => {
    // Chống cộng thưởng nhiều lần khi bấm lặp
    if (shiftStatuses[shift.id] === "COMPLETED") return;

    const reward = calculateCompletionReward(Boolean(shift.is_sos), rating);

    setShiftStatuses((prev) => ({
      ...prev,
      [shift.id]: "COMPLETED",
    }));

    setWalletBalance((prev) => {
      const newBal = prev + earnedAmount;
      try {
        localStorage.setItem("selltime_wallet_balance", newBal.toString());
      } catch (_) {}
      return newBal;
    });

    try {
      localStorage.setItem("selltime_escrow_sos_released", "true");
      window.dispatchEvent(new Event("selltime_escrow_released"));
    } catch (_) {}

    setCandidateProfile((prev) => ({
      ...prev,
      trust_battery: Math.min(100, Math.max(0, prev.trust_battery + reward.rewardPoints)),
    }));

    setEscrowPayoutToast({
      open: true,
      amount: earnedAmount,
      shiftTitle: shift.title,
    });
    setTimeout(() => {
      setEscrowPayoutToast(null);
    }, 6000);
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
                    description="Mở Employer DEMO để thử đăng ca, duyệt ứng viên mẫu và ký quỹ mô phỏng."
                    features={[
                      "Đăng ca khẩn cấp SOS thưởng nóng thu hút ứng viên",
                      "Duyệt ứng viên mẫu & Ký quỹ DEMO",
                      "Theo dõi điểm danh và thời gian DEMO",
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
                      "Huy hiệu thương hiệu mẫu, chưa kiểm duyệt thật",
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
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                        Việc Làm Phù Hợp ({rankedShifts.length})
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-slate-400 font-semibold">
                        Sắp xếp theo Matching Score AHP
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
                    checkinTimestamps={checkinTimestamps}
                    onStartCheckin={(s) => setCheckinShift(s)}
                    onStartCheckout={(s) => setCheckoutShift(s)}
                    onCancelShift={(s) => setCancelTargetShift(s)}
                  />
                ) : (
                  <LoginRequiredCard
                    title="Đăng nhập để theo dõi Ca làm việc"
                    description="Xem ca mẫu, thử check-in và checkout DEMO; chưa có điểm danh hoặc nhận tiền thật."
                    features={[
                      "Quản lý ca đã ứng tuyển & trạng thái xét duyệt",
                      "Điểm danh GPS 2 lớp & Mã PIN quầy 8866",
                      "Đồng hồ ca và cộng ví DEMO",
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
                    onWithdrawFunds={(amt) => {
                      setWalletBalance(0);
                      try {
                        localStorage.setItem("selltime_wallet_balance", "0");
                      } catch (_) {}
                    }}
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
                      "Mô phỏng rút tiền; không chuyển khoản ngân hàng",
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

      {/* TOAST THÔNG BÁO GIẢI NGÂN ESCROW TỰ ĐỘNG */}
      {escrowPayoutToast && escrowPayoutToast.open && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border border-emerald-500/50 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Escrow Tự Động Giải Ngân
                </span>
                <button
                  type="button"
                  onClick={() => setEscrowPayoutToast(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
              <h4 className="text-xs font-bold text-white mt-1">
                +{escrowPayoutToast.amount.toLocaleString("vi-VN")} đ đã vào ví
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                Ca: {escrowPayoutToast.shiftTitle}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Số dư ví mới:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {walletBalance.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
