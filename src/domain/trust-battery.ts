// ==========================================================
// SELL TIME PLATFORM - PARTYMODE & TRUST BATTERY LOGIC
// Quản trị rủi ro bùng ca, hủy ca và sạc lại pin uy tín
// ==========================================================

export interface PenaltyResult {
  penaltyPoints: number;
  isLockedFromSos: boolean;
  lockHours: number;
  reason: string;
}

export interface RewardResult {
  rewardPoints: number;
  reason: string;
}

/**
 * Tính toán mức phạt Trust Battery khi ứng viên hủy ca làm việc
 * @param hoursBeforeStart Số giờ tính từ lúc hủy đến lúc bắt đầu ca
 */
export function calculateCancellationPenalty(hoursBeforeStart: number): PenaltyResult {
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
