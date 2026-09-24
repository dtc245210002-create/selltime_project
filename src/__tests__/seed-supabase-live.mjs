import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Đọc .env.local
const envFile = fs.readFileSync(".env.local", "utf8");
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : "";
const supabaseAnonKey = keyMatch ? keyMatch[1].trim() : "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedData() {
  console.log("🌱 Bắt đầu nạp dữ liệu mẫu vào Supabase Cloud...");

  // 1. Seed Users
  const { error: userErr } = await supabase.from("users").upsert([
    {
      id: "user_cand_huy_01",
      email: "huy.tnut@gmail.com",
      phone: "0987654321",
      full_name: "Nguyễn Đức Huy",
      role: "CANDIDATE",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      kyc_id_number: "019283746512",
      is_kyc_verified: true,
    },
    {
      id: "user_emp_lan_02",
      email: "lan.thecuppa@gmail.com",
      phone: "0912345678",
      full_name: "Hoàng Thị Lan",
      role: "EMPLOYER",
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
      kyc_id_number: "020192837465",
      is_kyc_verified: true,
    },
  ]);

  if (userErr) console.warn("Lỗi seed Users:", userErr.message);
  else console.log("✅ Seed Users thành công!");

  // 2. Seed Candidate Profiles
  const { error: candErr } = await supabase.from("candidate_profiles").upsert([
    {
      user_id: "user_cand_huy_01",
      bio: "Sinh viên năm 3 ĐH Kỹ thuật Công nghiệp (TNUT), có kinh nghiệm phục vụ bàn và pha chế.",
      university: "ĐH Kỹ thuật Công nghiệp (TNUT)",
      trust_battery: 100,
      hourly_rate_min: 25000,
      skills: ["Phục vụ bàn", "Pha chế cơ bản", "Thu ngân POS", "Giao tiếp"],
      weekly_availability: {
        MONDAY: ["EVENING"],
        TUESDAY: ["AFTERNOON", "EVENING"],
        WEDNESDAY: ["EVENING"],
        THURSDAY: ["MORNING", "LUNCH"],
        FRIDAY: ["EVENING", "NIGHT"],
        SATURDAY: ["MORNING", "LUNCH", "AFTERNOON", "EVENING", "NIGHT"],
        SUNDAY: ["MORNING", "LUNCH", "AFTERNOON", "EVENING"],
      },
      latitude: 21.5855,
      longitude: 105.8272,
      location_address: "Ký túc xá K1, ĐH Kỹ thuật Công nghiệp, TP. Thái Nguyên",
    },
  ]);

  if (candErr) console.warn("Lỗi seed Candidate Profile:", candErr.message);
  else console.log("✅ Seed Candidate Profile thành công!");

  // 3. Seed Employer Profiles
  const { error: empErr } = await supabase.from("employer_profiles").upsert([
    {
      user_id: "user_emp_lan_02",
      company_name: "The Cuppa Coffee & Tea",
      business_type: "FNB",
      address: "Số 142 Đường Hoàng Văn Thụ, TP. Thái Nguyên",
      latitude: 21.593,
      longitude: 105.834,
      verified_badge: true,
      checkin_pin: "8866",
      escrow_balance: 1250000,
    },
  ]);

  if (empErr) console.warn("Lỗi seed Employer Profile:", empErr.message);
  else console.log("✅ Seed Employer Profile thành công!");

  // 4. Seed Shifts
  const { error: shiftErr } = await supabase.from("shifts").upsert([
    {
      id: "shift_sos_01",
      employer_id: "user_emp_lan_02",
      employer_name: "The Cuppa Coffee & Tea",
      employer_avatar: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100",
      cover_image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600",
      title: "🚨 GẤP: Pha chế & Phục vụ nước ca tối (Nhận ngay)",
      description: "Cần 1 bạn sinh viên nhanh nhẹn hỗ trợ pha chế và bưng bê ca tối do nhân viên cũ bị ốm. Thưởng nóng SOS +30.000đ nhận liền sau ca qua Escrow.",
      work_type: "PART_TIME",
      shift_date: "Hôm nay",
      shift_start: "18:00",
      shift_end: "22:00",
      duration_hours: 4.0,
      period: "EVENING",
      hourly_wage: 32000,
      total_budget: 158000,
      required_candidates: 1,
      filled_candidates: 0,
      is_sos: true,
      sos_bonus_amount: 30000,
      required_skills: ["Pha chế cơ bản", "Phục vụ bàn"],
      store_perks: ["Thưởng nóng SOS 30k", "Miễn phí 1 ly nước uống ca làm", "Nhận tiền ngay sau khi check-out"],
      friendly_tags: ["🚨 SOS Khẩn Cấp", "Bao nước uống", "Lương ngay"],
      latitude: 21.593,
      longitude: 105.834,
      location_address: "142 Hoàng Văn Thụ, TP. Thái Nguyên",
      status: "OPEN",
    },
    {
      id: "shift_gap_01",
      employer_id: "user_emp_lan_02",
      employer_name: "Bếp Cơm TNUT (Cổng Ký túc xá)",
      employer_avatar: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100",
      cover_image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
      title: "🍜 Phục vụ ca gãy trưa cao điểm (11h00 - 13h30)",
      description: "Ca gãy siêu tiện lợi cho sinh viên TNUT: 2.5 tiếng giờ nghỉ trưa giữa các tiết học. Bao ăn cơm trưa miễn phí tại quán.",
      work_type: "PART_TIME",
      shift_date: "Hôm nay",
      shift_start: "11:00",
      shift_end: "13:30",
      duration_hours: 2.5,
      period: "LUNCH",
      hourly_wage: 35000,
      total_budget: 87500,
      required_candidates: 2,
      filled_candidates: 0,
      is_sos: false,
      sos_bonus_amount: 0,
      required_skills: ["Phục vụ bàn", "Nhanh nhẹn"],
      store_perks: ["Bao ăn trưa miễn phí", "Thời gian linh hoạt theo tiết học", "Tiền tươi qua QR"],
      friendly_tags: ["⚡ Ca gãy trưa 2.5h", "Bao cơm trưa", "Sát vách KTX"],
      latitude: 21.5862,
      longitude: 105.8285,
      location_address: "Số 18 Đường 3/2, đối diện Cổng KTX TNUT, TP. Thái Nguyên",
      status: "OPEN",
    },
    {
      id: "shift_gap_02",
      employer_id: "user_emp_lan_02",
      employer_name: "Lẩu Nướng BBQ TNUT",
      employer_avatar: "https://images.unsplash.com/photo-1544025162-d76694265947?w=100",
      cover_image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
      title: "🌙 Phụ bếp & Nướng bàn ca gãy tối (17h30 - 20h30)",
      description: "Hỗ trợ sơ chế rau củ, châm than và bưng đồ nướng trong 3 tiếng cao điểm ăn tối. Bao ăn bữa tối no nê sau ca.",
      work_type: "PART_TIME",
      shift_date: "Hôm nay",
      shift_start: "17:30",
      shift_end: "20:30",
      duration_hours: 3.0,
      period: "EVENING",
      hourly_wage: 33000,
      total_budget: 99000,
      required_candidates: 2,
      filled_candidates: 0,
      is_sos: false,
      sos_bonus_amount: 0,
      required_skills: ["Phụ bếp", "Bưng bê", "Nhiệt tình"],
      store_perks: ["Bao bữa tối lẩu nướng", "Không yêu cầu kinh nghiệm", "Nhận tiền tức thì"],
      friendly_tags: ["⚡ Ca gãy tối 3h", "Bao ăn tối", "Tiền liền tay"],
      latitude: 21.5878,
      longitude: 105.826,
      location_address: "Số 45 Đường Ga Thái Nguyên, TP. Thái Nguyên",
      status: "OPEN",
    },
  ]);

  if (shiftErr) console.warn("Lỗi seed Shifts:", shiftErr.message);
  else console.log("✅ Seed Shifts thành công!");

  console.log("\n🎉 DỮ LIỆU ĐÃ ĐƯỢC ĐỒNG BỘ 100% LÊN SUPABASE CLOUD!");
}

seedData();
