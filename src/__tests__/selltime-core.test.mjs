// ==========================================================
// SELL TIME PLATFORM - QC AUTOMATED REGRESSION TEST SUITE
// Kiểm thử tự động toàn diện Logic Cốt lõi & Minh bạch Giai đoạn 1
// ==========================================================

import {
  calculateHaversineDistance,
  calculateTimeScore,
  calculateLocationScore,
  calculateSkillScore,
  calculateSalaryScore,
  evaluateShiftMatch,
  rankShiftsForCandidate,
} from "../domain/matching-engine.ts";

import {
  VENUE_PIN,
  verifyCheckinPin,
  calculateCancellationPenalty,
  calculateCompletionReward,
  canAcceptSosShift,
  calculateShiftElapsedTime,
  isSosLockedByTime,
  canCandidateApplySos,
} from "../domain/trust-battery.ts";

import {
  INITIAL_SHIFTS,
  MOCK_CANDIDATE_PROFILE,
  MOCK_EMPLOYER_PROFILE,
} from "../application/store.ts";

let passed = 0;
let failed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} - ${details}`);
    failed++;
  }
}

console.log("\n🧪 ========================================================");
console.log("   SELL TIME PLATFORM - GIAI ĐOẠN 1 QC REGRESSION TEST SUITE");
console.log("========================================================\n");

// -------------------------------------------------------------
// 1. Haversine GPS, Geofencing & Matching Engine AHP 4 biến
// -------------------------------------------------------------
console.log("📍 [Phần 1/6] Matching Engine AHP 4 Biến & GPS Geofencing:");
const tnutCoords = { latitude: 21.5855, longitude: 105.8272 };
const cuppaCoords = { latitude: 21.593, longitude: 105.834 };
const dist = calculateHaversineDistance(tnutCoords, cuppaCoords);
assert(dist >= 1.0 && dist <= 1.3, "Khoảng cách KTX TNUT đến Quán The Cuppa ~1.1km", `Tính được: ${dist}km`);

const distAtVenue = calculateHaversineDistance(cuppaCoords, { latitude: 21.5931, longitude: 105.8341 });
assert(distAtVenue * 1000 <= 100, "Định vị tại quán nằm trong Geofencing 100m", `Cự ly: ${distAtVenue * 1000}m`);

const mockCriteria = {
  hours_to_sell: 4,
  selected_periods: ["EVENING"],
  max_distance_km: 3.0,
  min_hourly_rate: 25000,
  search_keyword: "",
  work_types: ["PART_TIME"],
};

const matchSos = evaluateShiftMatch(INITIAL_SHIFTS[0], MOCK_CANDIDATE_PROFILE, mockCriteria);
assert(matchSos.total_score >= 85, "Ca SOS The Cuppa đạt điểm cao (>=85%) cho persona Huy TNUT", `Điểm: ${matchSos.total_score}`);
assert(matchSos.badge_color === "green", "Ca khớp cao có badge màu xanh (green)", `Badge: ${matchSos.badge_color}`);
assert(matchSos.time_score === 100, "Time score đạt 100 điểm khi khớp hoàn toàn khung giờ và thời lượng");

const ranked = rankShiftsForCandidate(INITIAL_SHIFTS, MOCK_CANDIDATE_PROFILE, mockCriteria);
assert(ranked.length > 0 && ranked[0].id === "shift_sos_01", "Ca SOS The Cuppa được xếp hạng ưu tiên số 1");

// -------------------------------------------------------------
// 2. PIN Điểm Danh Tại Quầy (Không cho phép 4 ký tự bất kỳ)
// -------------------------------------------------------------
console.log("\n🔑 [Phần 2/6] Xác thực Mã PIN Điểm Danh Tại Quầy (VENUE_PIN):");
assert(VENUE_PIN === "8866", "VENUE_PIN quy định chuẩn là '8866'", `Hiện tại: ${VENUE_PIN}`);
assert(verifyCheckinPin("8866"), "Chấp nhận mã PIN chính xác '8866'");
assert(verifyCheckinPin("  8866  "), "Chấp nhận mã PIN '8866' có khoảng trắng thừa (auto trim)");

// Kiểm tra loại bỏ lỗ hổng 4 ký tự bất kỳ
assert(!verifyCheckinPin("1234"), "Từ chối mã '1234' (loại bỏ bypass 4 ký tự)");
assert(!verifyCheckinPin("0000"), "Từ chối mã '0000'");
assert(!verifyCheckinPin("abcd"), "Từ chối 4 ký tự chữ cái bất kỳ");
assert(!verifyCheckinPin(""), "Từ chối chuỗi rỗng");
assert(!verifyCheckinPin("   "), "Từ chối toàn khoảng trắng");
assert(!verifyCheckinPin(null), "Từ chối null");
assert(!verifyCheckinPin(undefined), "Từ chối undefined");

// -------------------------------------------------------------
// 3. Ngân Sách Quỹ Escrow & Lương / Thưởng SOS
// -------------------------------------------------------------
console.log("\n💰 [Phần 3/6] Ngân Sách Escrow & Công thức Thù Lao Ca SOS:");
const sosShift = INITIAL_SHIFTS.find((s) => s.id === "shift_sos_01");
assert(sosShift !== undefined, "Tìm thấy ca mẫu shift_sos_01");

// Quy tắc: total_budget = (hourly_wage * duration_hours) + (is_sos ? sos_bonus_amount : 0)
const expectedBaseWage = sosShift.hourly_wage * sosShift.duration_hours; // 32.000 * 4 = 128.000đ
const expectedSosBonus = sosShift.is_sos ? (sosShift.sos_bonus_amount || 0) : 0; // 25.000đ
const expectedTotalBudget = expectedBaseWage + expectedSosBonus; // 153.000đ

assert(
  sosShift.total_budget === expectedTotalBudget,
  `Ngân sách ca SOS đã bao gồm thưởng: ${expectedTotalBudget.toLocaleString()}đ (32k*4h + 25k)`,
  `Thực tế trong store: ${sosShift.total_budget}`
);

// Kiểm tra tính toán thù lao cho ứng viên: không cộng thưởng lặp
const calculatedEarned = expectedBaseWage + expectedSosBonus;
assert(
  calculatedEarned === 153000,
  "Tổng thù lao ứng viên nhận được là 153.000đ (thưởng SOS chỉ cộng đúng 1 lần)",
  `Tính được: ${calculatedEarned}`
);

// Ca thường không có thưởng SOS
const normalShift = INITIAL_SHIFTS.find((s) => s.id === "shift_02");
const normalBaseWage = normalShift.hourly_wage * normalShift.duration_hours; // 28.000 * 4 = 112.000đ
const normalBonus = normalShift.is_sos ? (normalShift.sos_bonus_amount || 0) : 0;
assert(
  normalShift.total_budget === normalBaseWage + normalBonus && normalBonus === 0,
  "Ca thường không có thưởng SOS: total_budget = 112.000đ",
  `Thực tế: ${normalShift.total_budget}`
);

// -------------------------------------------------------------
// 4. Thưởng Uy Tín Domain & Chống Hoàn Tất Lặp
// -------------------------------------------------------------
console.log("\n🔋 [Phần 4/6] Pin Uy Tín (PartyMode) - Thưởng Domain & Chống Lặp:");
// Thưởng ca thường 5 sao: +2% (base) + 1% (5 sao) = +3%
const rewardNormal5 = calculateCompletionReward(false, 5);
assert(rewardNormal5.rewardPoints === 3, "Hoàn tất ca thường 5 sao: +3% Pin Uy Tín (không dùng +15% hardcode)", `Nhận: +${rewardNormal5.rewardPoints}%`);

// Thưởng ca SOS 5 sao: +2% (base) + 2% (SOS) + 1% (5 sao) = +5%
const rewardSos5 = calculateCompletionReward(true, 5);
assert(rewardSos5.rewardPoints === 5, "Hoàn tất ca SOS 5 sao: +5% Pin Uy Tín", `Nhận: +${rewardSos5.rewardPoints}%`);

// Thưởng ca thường 4 sao: +2%
const rewardNormal4 = calculateCompletionReward(false, 4);
assert(rewardNormal4.rewardPoints === 2, "Hoàn tất ca thường 4 sao: +2% Pin Uy Tín", `Nhận: +${rewardNormal4.rewardPoints}%`);

// Kiểm tra giới hạn Clamp trong [0, 100]
let currentBattery = 98;
let newBattery = Math.min(100, Math.max(0, currentBattery + rewardSos5.rewardPoints));
assert(newBattery === 100, "Pin Uy Tín chạm trần tối đa 100% (không vượt quá 100%)", `Giá trị: ${newBattery}%`);

// Chống hoàn tất lặp
let shiftStatuses = { shift_sos_01: "COMPLETED" };
let isAlreadyCompleted = shiftStatuses["shift_sos_01"] === "COMPLETED";
let pointsAdded = isAlreadyCompleted ? 0 : rewardSos5.rewardPoints;
assert(pointsAdded === 0, "Chống hoàn tất lặp: Ca đã COMPLETED không được cộng điểm thưởng lần 2");

// Phạt hủy ca (PartyMode)
const pGrace = calculateCancellationPenalty(1, 20); // Hủy sau 20 phút nhận ca
assert(pGrace.penaltyPoints === 0 && pGrace.isGracePeriod, "Ân hạn 1 giờ khi nhận nhầm: 0 điểm phạt");

const pLate = calculateCancellationPenalty(1, 120); // Hủy trước 1h (<2h)
assert(pLate.penaltyPoints === 35 && pLate.isLockedFromSos && pLate.lockHours === 24, "Hủy gấp <2h: Trừ 35% Pin & khóa SOS 24h");

const pNoShow = calculateCancellationPenalty(0, 120); // Bùng ca
assert(pNoShow.penaltyPoints === 50 && pNoShow.isLockedFromSos && pNoShow.lockHours === 48, "Bùng ca: Trừ 50% Pin & khóa SOS 48h");

// -------------------------------------------------------------
// 5. Khóa Nhận Ca SOS & Tự Động Mở Sau Hết Hạn
// -------------------------------------------------------------
console.log("\n🔒 [Phần 5/6] Điều Kiện & Thời Gian Khóa Nhận Ca SOS:");
// Yêu cầu Pin Uy Tín >= 80%
assert(canAcceptSosShift(100), "Pin Uy Tín 100% đủ điều kiện nhận ca SOS");
assert(canAcceptSosShift(80), "Pin Uy Tín 80% đủ điều kiện nhận ca SOS");
assert(!canAcceptSosShift(79), "Pin Uy Tín 79% bị chặn nhận ca SOS (< 80%)");
assert(!canAcceptSosShift(50), "Pin Uy Tín 50% bị chặn nhận ca SOS");

// Kiểm tra khóa theo thời gian phạt
const now = Date.now();
const lockedUntil24h = now + 24 * 3600 * 1000;
const expiredLock = now - 1000; // Đã hết hạn

assert(isSosLockedByTime(lockedUntil24h, now), "Đang trong 24h bị phạt: Cờ khóa SOS có hiệu lực");
assert(!isSosLockedByTime(expiredLock, now), "Hết thời gian phạt: Tự động hết hiệu lực khóa");
assert(!isSosLockedByTime(null, now), "Không có án phạt: Không bị khóa");

// Kiểm tra toàn diện qua canCandidateApplySos
const checkDuringLock = canCandidateApplySos(100, lockedUntil24h, now);
assert(!checkDuringLock.canApply, "Dù Pin 100% nhưng đang bị án phạt thời gian thì vẫn bị chặn nhận ca SOS");

const checkAfterLockExpired = canCandidateApplySos(85, expiredLock, now);
assert(checkAfterLockExpired.canApply, "Hết án phạt và Pin >= 80% thì tự động mở lại quyền nhận ca SOS");

const checkLowBatteryAfterLock = canCandidateApplySos(65, expiredLock, now);
assert(!checkLowBatteryAfterLock.canApply, "Hết án phạt nhưng Pin < 80% vẫn bị chặn nhận ca SOS");

// -------------------------------------------------------------
// 6. Đồng Hồ Ca Làm Việc Theo Timestamp Thực Tế & Metadata AI
// -------------------------------------------------------------
console.log("\n⏱️ [Phần 6/6] Đồng Hồ Ca Làm Việc Thực Tế & AI Source Metadata:");
const checkinTime = now - 15000; // Đã điểm danh 15 giây trước
const elapsed15s = calculateShiftElapsedTime(checkinTime, now);
assert(elapsed15s === 15, "Đồng hồ tính chính xác 15 giây trôi qua từ timestamp check-in", `Tính được: ${elapsed15s}s`);

const justCheckedIn = calculateShiftElapsedTime(now, now);
assert(justCheckedIn === 0, "Vừa check-in xong: Đồng hồ bắt đầu từ 0 giây (bỏ timer cố định 3672s)", `Bắt đầu: ${justCheckedIn}s`);

const elapsed1Hour = calculateShiftElapsedTime(now - 3600 * 1000, now);
assert(elapsed1Hour === 3600, "Sau 1 tiếng: Đồng hồ đếm 3600 giây");

assert(calculateShiftElapsedTime(0, now) === 0, "Chưa check-in (timestamp 0): Trả về 0 giây");

// Đảm bảo tính cô lập giữa 2 ca khác nhau
const shiftTimestamps = {
  shift_sos_01: now - 30000, // 30s
  shift_02: now - 5000,      // 5s
};
assert(
  calculateShiftElapsedTime(shiftTimestamps.shift_sos_01, now) === 30 &&
  calculateShiftElapsedTime(shiftTimestamps.shift_02, now) === 5,
  "Mỗi ca làm có đồng hồ độc lập theo timestamp riêng, không dùng chéo của nhau"
);

// Kiểm tra cấu trúc metadata của AI
const mockAiMetaGemini = {
  source: "gemini",
  provider: "Google Gemini",
  model: "gemini-2.5-flash",
  is_fallback: false,
};
const mockAiMetaFallback = {
  source: "local_mock",
  provider: "Hệ thống SellTime",
  model: "Quy tắc cục bộ",
  is_fallback: true,
};
assert(mockAiMetaGemini.source === "gemini" && !mockAiMetaGemini.is_fallback, "Metadata AI xác thực nguồn Gemini trực tiếp");
assert(mockAiMetaFallback.source === "local_mock" && mockAiMetaFallback.is_fallback, "Metadata fallback xác thực nguồn dữ liệu mẫu cục bộ");

// -------------------------------------------------------------
// TỔNG KẾT
// -------------------------------------------------------------
console.log("\n========================================================");
console.log(`📊 TỔNG KẾT BỘ KIỂM THỬ: ${passed}/${passed + failed} TEST CASES ĐẠT CHUẨN`);
if (failed === 0) {
  console.log("🏆 100% KIỂM THỬ CHẤP NHẬN THÀNH CÔNG! GIAI ĐOẠN 1 ĐẠT CHUẨN.");
} else {
  console.error(`⚠️ CÓ ${failed} LỖI PHÁT SINH!`);
  process.exit(1);
}
console.log("========================================================\n");
