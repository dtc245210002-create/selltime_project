// ==========================================================
// SELL TIME PLATFORM - QC / AUTOMATED TEST SUITE
// Kiểm thử tự động Tiêu chí Nghiệm thu (Acceptance Criteria)
// ==========================================================

function calculateHaversineDistance(coord1, coord2) {
  const R = 6371;
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const lat1 = (coord1.latitude * Math.PI) / 180;
  const lat2 = (coord2.latitude * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function calculateTimeScore(shift, criteria) {
  const isPeriodMatched = criteria.selected_periods.includes(shift.period);
  const periodScore = isPeriodMatched ? 100 : 20;

  const requestedHours = criteria.hours_to_sell || 4;
  const shiftHours = shift.duration_hours || 4;

  const durationRatio =
    shiftHours <= requestedHours
      ? shiftHours / requestedHours
      : requestedHours / shiftHours;

  const durationScore = Math.min(100, Math.round(durationRatio * 100));
  const totalTimeScore = Math.round(periodScore * 0.6 + durationScore * 0.4);
  return Math.min(100, Math.max(0, totalTimeScore));
}

function calculateLocationScore(candidateCoords, shiftCoords, maxDistanceKm) {
  const distanceKm = calculateHaversineDistance(candidateCoords, shiftCoords);
  if (distanceKm <= 1.0) return { locationScore: 100, distanceKm };
  if (distanceKm <= maxDistanceKm) {
    const score = 100 - ((distanceKm - 1.0) / Math.max(1, maxDistanceKm - 1.0)) * 40;
    return { locationScore: Math.round(score), distanceKm };
  }
  const excess = distanceKm - maxDistanceKm;
  const score = Math.max(0, 50 - excess * 15);
  return { locationScore: Math.round(score), distanceKm };
}

function calculateSkillScore(candidateSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  const normalizedCandidate = candidateSkills.map((s) => s.toLowerCase().trim());
  const matchedCount = requiredSkills.filter((req) =>
    normalizedCandidate.includes(req.toLowerCase().trim())
  ).length;
  return Math.round((matchedCount / requiredSkills.length) * 100);
}

function calculateSalaryScore(shiftHourlyWage, minExpectedRate) {
  if (minExpectedRate <= 0) return 100;
  if (shiftHourlyWage >= minExpectedRate) {
    const surplusRatio = (shiftHourlyWage - minExpectedRate) / minExpectedRate;
    return Math.round(85 + Math.min(15, surplusRatio * 50));
  }
  const deficitRatio = shiftHourlyWage / minExpectedRate;
  return Math.max(0, Math.round(deficitRatio * 80));
}

function evaluateShiftMatch(shift, candidateProfile, criteria) {
  const timeScore = calculateTimeScore(shift, criteria);
  const { locationScore, distanceKm } = calculateLocationScore(
    candidateProfile.location_coords,
    shift.location_coords,
    criteria.max_distance_km
  );
  const skillScore = calculateSkillScore(
    candidateProfile.skills,
    shift.required_skills
  );
  const salaryScore = calculateSalaryScore(
    shift.hourly_wage,
    criteria.min_hourly_rate
  );

  const totalScore = Math.round(
    0.35 * timeScore +
      0.25 * locationScore +
      0.25 * skillScore +
      0.15 * salaryScore
  );

  let badgeColor = "gray";
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
    badge_color: badgeColor,
    badge_label: badgeLabel,
  };
}

// ==========================================
// TEST CASES
// ==========================================
console.log("==================================================");
console.log("🧪 AGENT QC: BẮT ĐẦU CHẠY KIỂM THỬ ACCEPTANCE TEST");
console.log("==================================================\n");

let passedCount = 0;
let totalCount = 0;

function assert(description, condition) {
  totalCount++;
  if (condition) {
    console.log(`✅ [PASS] ${description}`);
    passedCount++;
  } else {
    console.error(`❌ [FAIL] ${description}`);
  }
}

// Test Data
const mockCandidate = {
  skills: ["Phục vụ bàn", "Pha chế cơ bản", "Thu ngân POS"],
  location_coords: { latitude: 21.5855, longitude: 105.8272 }, // KTX TNUT
  hourly_rate_min: 25000,
};

const mockCriteria = {
  hours_to_sell: 4,
  selected_periods: ["EVENING"],
  max_distance_km: 3.0,
  min_hourly_rate: 25000,
};

// 1. Test Haversine GPS distance
const dist = calculateHaversineDistance(
  { latitude: 21.5855, longitude: 105.8272 },
  { latitude: 21.593, longitude: 105.834 }
);
assert("TC-1: Tính khoảng cách GPS TNUT đến Quán The Cuppa ~1.1km", dist >= 1.0 && dist <= 1.3);

// 2. Test Ca SOS The Cuppa (Hoàn hảo cho Huy)
const shiftSos = {
  title: "Tuyển gấp ca tối The Cuppa",
  period: "EVENING",
  duration_hours: 4,
  hourly_wage: 32000,
  required_skills: ["Phục vụ bàn"],
  location_coords: { latitude: 21.593, longitude: 105.834 },
};
const resSos = evaluateShiftMatch(shiftSos, mockCandidate, mockCriteria);
assert("TC-2.1: Matching Score ca tối The Cuppa phải >= 85% (Badge Green)", resSos.total_score >= 85 && resSos.badge_color === "green");
assert("TC-2.2: Time Score phải đạt 100 điểm do khớp ca tối và thời lượng 4 tiếng", resSos.time_score === 100);
assert("TC-2.3: Skill Score phải đạt 100 điểm do ứng viên có kỹ năng Phục vụ bàn", resSos.skill_score === 100);

// 3. Test Ca khác khung giờ (Đêm)
const shiftNight = {
  title: "Kiểm hàng ca đêm",
  period: "NIGHT",
  duration_hours: 5,
  hourly_wage: 35000,
  required_skills: ["Cẩn thận"],
  location_coords: { latitude: 21.565, longitude: 105.815 },
};
const resNight = evaluateShiftMatch(shiftNight, mockCandidate, mockCriteria);
assert("TC-3: Ca đêm khác khung giờ đã chọn phải có Time Score thấp (<= 50)", resNight.time_score <= 50);

// 4. Test Lương thấp hơn lương sàn kỳ vọng
const shiftLowPay = {
  title: "Bán hàng giá rẻ",
  period: "EVENING",
  duration_hours: 4,
  hourly_wage: 15000, // Thấp hơn 25.000đ
  required_skills: ["Phục vụ bàn"],
  location_coords: { latitude: 21.5855, longitude: 105.8272 },
};
const resLowPay = evaluateShiftMatch(shiftLowPay, mockCandidate, mockCriteria);
assert("TC-4: Ca có mức lương thấp hơn lương sàn phải bị trừ điểm lương (< 60)", resLowPay.salary_score < 60);

// 5. Test Phân hạng màu sắc (Badge Color)
assert("TC-5: Phân loại màu sắc chính xác theo quy chuẩn FR-7", 
  resSos.badge_color === "green" && (resNight.badge_color === "yellow" || resNight.badge_color === "gray")
);

console.log("\n==================================================");
console.log(`🎉 KẾT QUẢ KIỂM THỬ: ${passedCount}/${totalCount} TEST CASES ĐẠT!`);
console.log("==================================================");

if (passedCount === totalCount) {
  process.exit(0);
} else {
  process.exit(1);
}
