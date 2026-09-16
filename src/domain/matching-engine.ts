// ==========================================================
// SELL TIME PLATFORM - MULTI-VARIABLE MATCHING ENGINE
// Thực hiện FR-6 & PRD Matching Engine Spec 4 trọng số
// S = 0.35*S_Time + 0.25*S_Loc + 0.25*S_Skill + 0.15*S_Salary
// ==========================================================

import {
  CandidateFilterCriteria,
  CandidateProfile,
  GeoPoint,
  MatchBreakdown,
  Shift,
  ShiftWithMatch,
} from "./types";

/**
 * Tính khoảng cách đường chim bay giữa 2 tọa độ GPS (Haversine Formula)
 * @returns Khoảng cách tính bằng Kilometers (km), làm tròn 1 chữ số thập phân
 */
export function calculateHaversineDistance(
  coord1: GeoPoint,
  coord2: GeoPoint
): number {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const lat1 = (coord1.latitude * Math.PI) / 180;
  const lat2 = (coord2.latitude * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * 1. Tính điểm Thời Gian (S_Time) - Trọng số 35%
 */
export function calculateTimeScore(
  shift: Shift,
  criteria: CandidateFilterCriteria
): number {
  const isPeriodMatched = criteria.selected_periods.includes(shift.period);
  const periodScore = isPeriodMatched ? 100 : 20;

  // So khớp thời lượng ca so với số giờ muốn bán
  const requestedHours = criteria.hours_to_sell || 4;
  const shiftHours = shift.duration_hours || 4;

  const durationRatio =
    shiftHours <= requestedHours
      ? shiftHours / requestedHours
      : requestedHours / shiftHours;

  const durationScore = Math.min(100, Math.round(durationRatio * 100));

  // Kết hợp 60% trùng khớp khung giờ (Sáng/Chiều/Tối) + 40% khớp thời lượng
  const totalTimeScore = Math.round(periodScore * 0.6 + durationScore * 0.4);
  return Math.min(100, Math.max(0, totalTimeScore));
}

/**
 * 2. Tính điểm Vị Trí (S_Location) - Trọng số 25%
 */
export function calculateLocationScore(
  candidateCoords: GeoPoint,
  shiftCoords: GeoPoint,
  maxDistanceKm: number
): { locationScore: number; distanceKm: number } {
  const distanceKm = calculateHaversineDistance(candidateCoords, shiftCoords);

  if (distanceKm <= 1.0) {
    return { locationScore: 100, distanceKm };
  }

  if (distanceKm <= maxDistanceKm) {
    // Giảm tuyến tính từ 100 xuống 60 trong phạm vi cho phép
    const score = 100 - ((distanceKm - 1.0) / Math.max(1, maxDistanceKm - 1.0)) * 40;
    return { locationScore: Math.round(score), distanceKm };
  }

  // Vượt quá bán kính mong muốn: Phạt nặng
  const excess = distanceKm - maxDistanceKm;
  const score = Math.max(0, 50 - excess * 15);
  return { locationScore: Math.round(score), distanceKm };
}

/**
 * 3. Tính điểm Kỹ Năng (S_Skill) - Trọng số 25%
 */
export function calculateSkillScore(
  candidateSkills: string[],
  requiredSkills: string[]
): number {
  if (!requiredSkills || requiredSkills.length === 0) {
    return 100;
  }

  const normalizedCandidate = candidateSkills.map((s) => s.toLowerCase().trim());
  const matchedCount = requiredSkills.filter((req) =>
    normalizedCandidate.includes(req.toLowerCase().trim())
  ).length;

  const ratio = matchedCount / requiredSkills.length;
  return Math.round(ratio * 100);
}

/**
 * 4. Tính điểm Mức Lương (S_Salary) - Trọng số 15%
 */
export function calculateSalaryScore(
  shiftHourlyWage: number,
  minExpectedRate: number
): number {
  if (minExpectedRate <= 0) return 100;

  if (shiftHourlyWage >= minExpectedRate) {
    // Đạt hoặc vượt lương sàn
    const surplusRatio = (shiftHourlyWage - minExpectedRate) / minExpectedRate;
    const score = 85 + Math.min(15, surplusRatio * 50);
    return Math.round(score);
  }

  // Thấp hơn lương sàn kỳ vọng
  const deficitRatio = shiftHourlyWage / minExpectedRate;
  return Math.max(0, Math.round(deficitRatio * 80));
}

/**
 * Hàm Tổng Hợp Matching Engine Đa Biến
 */
export function evaluateShiftMatch(
  shift: Shift,
  candidateProfile: CandidateProfile,
  criteria: CandidateFilterCriteria
): MatchBreakdown {
  // 1. Time Score (0.35)
  const timeScore = calculateTimeScore(shift, criteria);

  // 2. Location Score (0.25)
  const { locationScore, distanceKm } = calculateLocationScore(
    candidateProfile.location_coords,
    shift.location_coords,
    criteria.max_distance_km
  );

  // 3. Skill Score (0.25)
  const skillScore = calculateSkillScore(
    candidateProfile.skills,
    shift.required_skills
  );

  // 4. Salary Score (0.15)
  const salaryScore = calculateSalaryScore(
    shift.hourly_wage,
    criteria.min_hourly_rate
  );

  // Công thức chuẩn FR-6
  const totalScore = Math.round(
    0.35 * timeScore +
      0.25 * locationScore +
      0.25 * skillScore +
      0.15 * salaryScore
  );

  // Xác định Badge Color & Label theo PRD FR-7
  let badgeColor: MatchBreakdown["badge_color"] = "gray";
  let badgeLabel = "Cân nhắc";

  if (totalScore >= 85) {
    badgeColor = "green";
    badgeLabel = "Rất phù hợp";
  } else if (totalScore >= 70) {
    badgeColor = "blue";
    badgeLabel = "Phù hợp cao";
  } else if (totalScore >= 50) {
    badgeColor = "yellow";
    badgeLabel = "Khá phù hợp";
  }

  return {
    time_score: timeScore,
    location_score: locationScore,
    skill_score: skillScore,
    salary_score: salaryScore,
    total_score: totalScore,
    distance_km: distanceKm,
    duration_hours: shift.duration_hours,
    badge_color: badgeColor,
    badge_label: badgeLabel,
  };
}

/**
 * Xử lý danh sách bài đăng và sắp xếp theo Matching Score giảm dần
 */
export function rankShiftsForCandidate(
  shifts: Shift[],
  candidateProfile: CandidateProfile,
  criteria: CandidateFilterCriteria
): ShiftWithMatch[] {
  let filtered = shifts;

  // 1. Lọc theo từ khóa tìm kiếm (search_keyword)
  if (criteria.search_keyword && criteria.search_keyword.trim().length > 0) {
    const q = criteria.search_keyword.toLowerCase().trim();
    filtered = filtered.filter((s) => {
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchEmployer = s.employer_name.toLowerCase().includes(q);
      const matchAddress = s.location_address.toLowerCase().includes(q);
      const matchSkill = s.required_skills?.some((sk) =>
        sk.toLowerCase().includes(q)
      );
      return matchTitle || matchDesc || matchEmployer || matchAddress || matchSkill;
    });
  }

  // 2. Lọc theo hình thức công việc (work_types)
  if (criteria.work_types && criteria.work_types.length > 0) {
    filtered = filtered.filter((s) => criteria.work_types.includes(s.work_type));
  }

  return filtered
    .map((shift) => ({
      ...shift,
      match: evaluateShiftMatch(shift, candidateProfile, criteria),
    }))
    .sort((a, b) => b.match.total_score - a.match.total_score);
}
