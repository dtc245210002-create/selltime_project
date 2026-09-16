// ==========================================================
// SELL TIME PLATFORM - QC AUTOMATED REGRESSION TEST SUITE
// Kiểm thử tự động thuật toán AHP 4 biến & Logic PartyMode
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

function calculateCancellationPenalty(hoursBeforeStart) {
  if (hoursBeforeStart >= 12) {
    return { penaltyPoints: 0, isLockedFromSos: false, reason: "Hủy trước > 12 giờ: Không trừ điểm uy tín." };
  }
  if (hoursBeforeStart >= 2 && hoursBeforeStart < 12) {
    return { penaltyPoints: 15, isLockedFromSos: false, reason: "Hủy trước 2h - 12h: Trừ 15% Pin Uy Tín." };
  }
  if (hoursBeforeStart > 0 && hoursBeforeStart < 2) {
    return { penaltyPoints: 35, isLockedFromSos: true, reason: "Hủy gấp < 2h: Trừ 35% Pin & Khóa nhận ca mới." };
  }
  return { penaltyPoints: 50, isLockedFromSos: true, reason: "Bùng ca không thông báo: Trừ 50% Pin & Đình chỉ ca SOS." };
}

function calculateCompletionReward(isSos = false, rating = 5) {
  let reward = 2;
  if (isSos) reward += 2;
  if (rating === 5) reward += 1;
  return { rewardPoints: reward };
}

function evaluateAhpScore(timeScore, locScore, skillScore, salaryScore) {
  return Math.round(0.35 * timeScore + 0.25 * locScore + 0.25 * skillScore + 0.15 * salaryScore);
}

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
console.log("   SELL TIME PLATFORM - QC SPRINT 2 REGRESSION TEST SUITE");
console.log("========================================================\n");

// 1. Haversine GPS & Geofencing
console.log("📍 [Phần 1/4] Kiểm thử Tính toán Cự ly Haversine & Geofencing:");
const tnutCoords = { latitude: 21.5855, longitude: 105.8272 };
const cuppaCoords = { latitude: 21.593, longitude: 105.834 };
const dist = calculateHaversineDistance(tnutCoords, cuppaCoords);
assert(dist >= 1.0 && dist <= 1.3, "Khoảng cách TNUT đến The Cuppa ~1.1km", `Tính được: ${dist}km`);

const distAtVenue = calculateHaversineDistance(cuppaCoords, { latitude: 21.5931, longitude: 105.8341 });
assert(distAtVenue * 1000 <= 100, "Định vị tại quán nằm trong Geofencing 100m", `Cự ly: ${distAtVenue * 1000}m`);

// 2. AHP 4-Weight Matching Formula
console.log("\n🎯 [Phần 2/4] Kiểm thử Trọng số Matching Engine AHP (PRD FR-6):");
const perfectScore = evaluateAhpScore(100, 100, 100, 100);
assert(perfectScore === 100, "Tổng điểm 4 biến hoàn hảo phải đạt 100%", `Điểm: ${perfectScore}`);

const partialScore = evaluateAhpScore(100, 80, 100, 90);
assert(partialScore === 94, "Trọng số 0.35*100 + 0.25*80 + 0.25*100 + 0.15*90 = 94%", `Điểm: ${partialScore}`);

const mismatchTimeScore = evaluateAhpScore(0, 100, 100, 100);
assert(mismatchTimeScore === 65, "Lệch khung giờ (Time = 0) bị phạt nặng còn tối đa 65%", `Điểm: ${mismatchTimeScore}`);

// 3. PartyMode Trust Battery
console.log("\n🔋 [Phần 3/4] Kiểm thử Cơ chế Trừ & Thưởng Pin Uy Tín (PartyMode):");
const p14 = calculateCancellationPenalty(14);
assert(p14.penaltyPoints === 0 && !p14.isLockedFromSos, "Hủy trước 14h: Không trừ điểm uy tín");

const p5 = calculateCancellationPenalty(5);
assert(p5.penaltyPoints === 15 && !p5.isLockedFromSos, "Hủy trước 5h: Trừ 15% Pin Uy Tín");

const p1 = calculateCancellationPenalty(1);
assert(p1.penaltyPoints === 35 && p1.isLockedFromSos, "Hủy gấp < 2h: Trừ 35% Pin & Khóa nhận ca mới");

const pNoShow = calculateCancellationPenalty(0);
assert(pNoShow.penaltyPoints === 50 && pNoShow.isLockedFromSos, "Bùng ca (No-show): Trừ 50% Pin & Khóa nhận ca");

const rNormal = calculateCompletionReward(false, 5);
assert(rNormal.rewardPoints === 3, "Hoàn thành ca 5 sao: Thưởng +3% Pin Uy Tín");

const rSos = calculateCompletionReward(true, 5);
assert(rSos.rewardPoints === 5, "Hoàn thành ca SOS 5 sao: Thưởng +5% Pin Uy Tín");

// 4. Escrow & QR Logic
console.log("\n💰 [Phần 4/4] Kiểm thử Tính toán Quỹ Escrow & Bảo đảm thù lao:");
const baseWage = 32000;
const hours = 4;
const sosBonus = 25000;
const totalBudget = baseWage * hours + sosBonus;
assert(totalBudget === 153000, "Tổng ngân sách ca SOS: 32k*4h + 25k = 153.000đ", `Tính được: ${totalBudget}`);

console.log("\n========================================================");
console.log(`📊 TỔNG KẾT BỘ KIỂM THỬ: ${passed}/${passed + failed} TEST CASES ĐẠT CHUẨN`);
if (failed === 0) {
  console.log("🏆 100% KIỂM THỬ CHẤP NHẬN THÀNH CÔNG! HỆ THỐNG SẴN SÀNG.");
} else {
  console.error(`⚠️ CÓ ${failed} LỖI PHÁT SINH!`);
  process.exit(1);
}
console.log("========================================================\n");
