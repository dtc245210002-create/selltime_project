// ==========================================================
// SELL TIME PLATFORM - PARTYMODE & TRUST BATTERY LOGIC
// Quản trị rủi ro bùng ca, hủy ca và sạc lại pin uy tín
// ==========================================================

export interface PenaltyResult {
  penaltyPoints: number;
  isLockedFromSos: boolean;
  lockHours: number;
  reason: string;
  isGracePeriod?: boolean;
}

export interface RewardResult {
  rewardPoints: number;
  reason: string;
}

/**
 * Tính toán mức phạt Trust Battery khi ứng viên hủy ca làm việc
 * @param hoursBeforeStart Số giờ tính từ lúc hủy đến lúc bắt đầu ca
 * @param minutesSinceBooking Số phút kể từ lúc bấm nhận ca (Dùng cho chính sách ân hạn ấn nhầm trong 1h)
 */
export function calculateCancellationPenalty(
  hoursBeforeStart: number,
  minutesSinceBooking?: number
): PenaltyResult {
  // Chính sách ân hạn: Nếu có truyền thời gian đặt và hủy trong vòng 60 phút (1 giờ) kể từ khi bấm nhận ca -> Miễn phạt hoàn toàn
  if (typeof minutesSinceBooking === "number" && minutesSinceBooking >= 0 && minutesSinceBooking <= 60) {
    return {
      penaltyPoints: 0,
      isLockedFromSos: false,
      lockHours: 0,
      isGracePeriod: true,
      reason: "Ân hạn 1 giờ khi ấn nhầm: Miễn trừ phạt và không trừ Pin Uy Tín.",
    };
  }

  if (hoursBeforeStart >= 12) {
    return {
      penaltyPoints: 0,
      isLockedFromSos: false,
      lockHours: 0,
      reason: "Hủy trước > 12 giờ: Không trừ điểm uy tín.",
    };
  }

  if (hoursBeforeStart >= 2 && hoursBeforeStart < 12) {
    return {
      penaltyPoints: 15,
      isLockedFromSos: false,
      lockHours: 0,
      reason: "Hủy trước 2h - 12h: Trừ 15% Pin Uy Tín do làm xáo trộn lịch quán.",
    };
  }

  if (hoursBeforeStart > 0 && hoursBeforeStart < 2) {
    return {
      penaltyPoints: 35,
      isLockedFromSos: true,
      lockHours: 24,
      reason: "Hủy gấp < 2h: Trừ 35% Pin Uy Tín & tạm khóa nhận ca mới 24h.",
    };
  }

  // Bùng ca không đến (No-show)
  return {
    penaltyPoints: 50,
    isLockedFromSos: true,
    lockHours: 48,
    reason: "Bùng ca không thông báo: Trừ 50% Pin Uy Tín & đình chỉ ca SOS trong 48h.",
  };
}

/**
 * Thưởng tăng Pin Uy Tín khi hoàn thành ca làm việc đúng giờ
 * @param isSos Ca SOS hay ca thường
 * @param rating Đánh giá từ chủ cơ sở (1 - 5 sao)
 */
export function calculateCompletionReward(isSos: boolean = false, rating: number = 5): RewardResult {
  let reward = 2; // Mặc định +2% mỗi ca hoàn tất
  if (isSos) reward += 2; // Ca SOS khẩn cấp +4%
  if (rating === 5) reward += 1; // Được 5 sao từ chủ quán +1%

  return {
    rewardPoints: reward,
    reason: `Hoàn thành ca làm xuất sắc (${rating}⭐): Tăng +${reward}% Pin Uy Tín.`,
  };
}

/**
 * Kiểm tra xem ứng viên có đủ điều kiện nhận ca SOS khẩn cấp không
 * Yêu cầu Trust Battery tối thiểu >= 80%
 */
export function canAcceptSosShift(trustBattery: number): boolean {
  return trustBattery >= 80;
}

/**
 * Mã PIN điểm danh mẫu tại cơ sở (The Cuppa Coffee)
 */
export const VENUE_PIN = "8866";

/**
 * Xác thực mã PIN điểm danh tại cơ sở
 * Chỉ chấp nhận đúng VENUE_PIN ("8866" sau khi trim), từ chối mọi giá trị khác hoặc rỗng
 */
export function verifyCheckinPin(inputPin: string, expectedPin: string = VENUE_PIN): boolean {
  if (!inputPin) return false;
  return inputPin.trim() === expectedPin;
}

/**
 * Tính số giây trôi qua thực tế của ca làm việc từ thời điểm check-in
 * @param checkinTimestamp Thời điểm check-in (ms)
 * @param currentTimestamp Thời điểm hiện tại (ms, mặc định Date.now())
 */
export function calculateShiftElapsedTime(
  checkinTimestamp: number,
  currentTimestamp: number = Date.now()
): number {
  if (!checkinTimestamp || currentTimestamp < checkinTimestamp) return 0;
  return Math.floor((currentTimestamp - checkinTimestamp) / 1000);
}

/**
 * Kiểm tra xem tài khoản có đang trong thời gian bị phạt khóa nhận ca SOS không
 */
export function isSosLockedByTime(
  lockUntilTimestamp: number | null,
  currentTimestamp: number = Date.now()
): boolean {
  if (!lockUntilTimestamp) return false;
  return currentTimestamp < lockUntilTimestamp;
}

/**
 * Đánh giá toàn diện quyền ứng tuyển ca SOS
 */
export function canCandidateApplySos(
  trustBattery: number,
  lockUntilTimestamp: number | null = null,
  currentTimestamp: number = Date.now()
): { canApply: boolean; reason?: string } {
  if (isSosLockedByTime(lockUntilTimestamp, currentTimestamp)) {
    const remainingHours = Math.max(1, Math.ceil((lockUntilTimestamp! - currentTimestamp) / (3600 * 1000)));
    return {
      canApply: false,
      reason: `Tài khoản đang bị tạm khóa nhận ca SOS (còn khoảng ${remainingHours} giờ).`,
    };
  }
  if (!canAcceptSosShift(trustBattery)) {
    return {
      canApply: false,
      reason: `Pin Uy Tín của bạn đang là ${trustBattery}%. Cần tối thiểu 80% để nhận ca SOS.`,
    };
  }
  return { canApply: true };
}
