// ==========================================================
// SELL TIME PLATFORM - MOCK DATA STORE & APPLICATION STATE
// Chứa dữ liệu thực tế: Sinh viên Huy (TNUT) & Chị Lan Cafe
// ==========================================================

import {
  AvailabilitySlot,
  CandidateFilterCriteria,
  CandidateProfile,
  EmployerProfile,
  Shift,
  User,
} from "../domain/types";

// 1. Dữ liệu Persona Sinh viên: Nguyễn Đức Huy (TNUT Thái Nguyên)
export const MOCK_CANDIDATE_USER: User = {
  id: "user_cand_huy_01",
  email: "huy.tnut@gmail.com",
  phone: "0987654321",
  full_name: "Nguyễn Đức Huy",
  role: "CANDIDATE",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  kyc_id_number: "019283746512",
  is_kyc_verified: true,
  created_at: "2026-09-01T08:00:00Z",
};

export const MOCK_CANDIDATE_PROFILE: CandidateProfile = {
  user_id: "user_cand_huy_01",
  bio: "Sinh viên năm 3 ngành Tự động hóa - ĐH Kỹ thuật Công nghiệp (TNUT). Năng động, kỷ luật, tìm việc ca tối kiếm thêm thu nhập.",
  university: "ĐH Kỹ thuật Công nghiệp (TNUT) - Thái Nguyên",
  trust_battery: 100, // 100% pin uy tín PartyMode
  hourly_rate_min: 25000, // 25k/h
  skills: ["Phục vụ bàn", "Pha chế cơ bản", "Thu ngân POS", "Giao hàng"],
  location_coords: {
    latitude: 21.5855, // Tọa độ Ký túc xá TNUT
    longitude: 105.8272,
  },
  location_address: "Ký túc xá K1, ĐH Kỹ thuật Công nghiệp, TP. Thái Nguyên",
};

// 2. Khung giờ rảnh mặc định của Huy: Tối (18h-22h) từ Thứ 2 đến Thứ 6
export const MOCK_AVAILABILITY_SLOTS: AvailabilitySlot[] = [
  { id: "slot_1", day_of_week: 1, start_time: "18:00", end_time: "22:00", period: "EVENING" },
  { id: "slot_2", day_of_week: 2, start_time: "18:00", end_time: "22:00", period: "EVENING" },
  { id: "slot_3", day_of_week: 3, start_time: "18:00", end_time: "22:00", period: "EVENING" },
  { id: "slot_4", day_of_week: 4, start_time: "18:00", end_time: "22:00", period: "EVENING" },
  { id: "slot_5", day_of_week: 5, start_time: "18:00", end_time: "22:00", period: "EVENING" },
];

// 3. Dữ liệu Persona Nhà tuyển dụng: Chị Lan (Chủ The Cuppa Coffee)
export const MOCK_EMPLOYER_USER: User = {
  id: "user_emp_lan_02",
  email: "lan.thecuppa@gmail.com",
  phone: "0912345678",
  full_name: "Hoàng Thị Lan",
  role: "EMPLOYER",
  avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  kyc_id_number: "020192837465",
  is_kyc_verified: true,
  created_at: "2026-08-15T10:00:00Z",
};

export const MOCK_EMPLOYER_PROFILE: EmployerProfile = {
  user_id: "user_emp_lan_02",
  company_name: "The Cuppa Coffee & Tea",
  business_type: "FNB",
  address: "Số 142 Đường Hoàng Văn Thụ, TP. Thái Nguyên",
  location_coords: {
    latitude: 21.593, // Cách TNUT ~1.1km
    longitude: 105.834,
  },
  verified_badge: true,
};

// 4. Danh sách các ca làm việc mẫu tại TP. Thái Nguyên
export const INITIAL_SHIFTS: Shift[] = [
  {
    id: "shift_sos_01",
    employer_id: "user_emp_lan_02",
    employer_name: "The Cuppa Coffee",
    employer_avatar: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&auto=format&fit=crop&q=80",
    title: "🚨 Tuyển GẤP Phục vụ ca tối (Bù nhân viên ốm)",
    description: "Cần 1 bạn bưng bê, dọn bàn và hỗ trợ order đồ uống tại quầy. Nhận lương ngay cuối ca qua VietQR PayOS.",
    work_type: "PART_TIME",
    shift_date: "Hôm nay",
    shift_start: "18:00",
    shift_end: "22:00",
    duration_hours: 4,
    period: "EVENING",
    hourly_wage: 32000,
    total_budget: 128000,
    required_candidates: 1,
    filled_candidates: 0,
    is_sos: true,
    sos_bonus_amount: 25000,
    required_skills: ["Phục vụ bàn"],
    location_coords: {
      latitude: 21.593,
      longitude: 105.834,
    },
    location_address: "142 Hoàng Văn Thụ, P. Phan Đình Phùng, TP. Thái Nguyên",
    status: "OPEN",
    created_at: "2026-09-12T01:30:00Z",
  },
  {
    id: "shift_02",
    employer_id: "emp_tea_03",
    employer_name: "Trà Sữa Ding Tea Thái Nguyên",
    title: "Nhân viên Pha chế & Thu ngân ca Tối",
    description: "Pha chế theo công thức chuẩn, thao tác máy tính tiền POS, đón tiếp khách hàng lịch sự.",
    work_type: "PART_TIME",
    shift_date: "Hôm nay",
    shift_start: "17:30",
    shift_end: "21:30",
    duration_hours: 4,
    period: "EVENING",
    hourly_wage: 28000,
    total_budget: 112000,
    required_candidates: 2,
    filled_candidates: 1,
    is_sos: false,
    required_skills: ["Pha chế cơ bản", "Thu ngân POS"],
    location_coords: {
      latitude: 21.589,
      longitude: 105.831,
    },
    location_address: "88 Lương Ngọc Quyến, TP. Thái Nguyên",
    status: "OPEN",
    created_at: "2026-09-11T14:00:00Z",
  },
  {
    id: "shift_03",
    employer_id: "emp_mart_04",
    employer_name: "Circle K Sinh Viên",
    title: "Thu ngân & Sắp xếp hàng hóa ca Chiều",
    description: "Nhận hàng từ kho, kiểm kê date bánh mì, thanh toán đơn hàng cho sinh viên.",
    work_type: "PART_TIME",
    shift_date: "Hôm nay",
    shift_start: "12:30",
    shift_end: "17:30",
    duration_hours: 5,
    period: "AFTERNOON",
    hourly_wage: 25000,
    total_budget: 125000,
    required_candidates: 1,
    filled_candidates: 0,
    is_sos: false,
    required_skills: ["Thu ngân POS"],
    location_coords: {
      latitude: 21.583,
      longitude: 105.824,
    },
    location_address: "Đối diện cổng ĐH Sư Phạm Thái Nguyên",
    status: "OPEN",
    created_at: "2026-09-11T16:00:00Z",
  },
  {
    id: "shift_04",
    employer_id: "emp_tutor_05",
    employer_name: "Gia Sư & Luyện Thi Tri Thức",
    title: "Gia sư kèm Toán & Tiếng Anh lớp 7",
    description: "Kèm 1-1 cho học sinh THCS, củng cố bài học trên lớp và giải bài tập về nhà.",
    work_type: "GIG",
    shift_date: "Hôm nay",
    shift_start: "19:00",
    shift_end: "21:00",
    duration_hours: 2,
    period: "EVENING",
    hourly_wage: 75000,
    total_budget: 150000,
    required_candidates: 1,
    filled_candidates: 0,
    is_sos: false,
    required_skills: ["Gia sư", "Giao tiếp"],
    location_coords: {
      latitude: 21.587,
      longitude: 105.829,
    },
    location_address: "Khu dân cư Quang Trung, TP. Thái Nguyên",
    status: "OPEN",
    created_at: "2026-09-10T20:00:00Z",
  },
  {
    id: "shift_05",
    employer_id: "emp_night_06",
    employer_name: "Kho Vận Logistics Express",
    title: "Kiểm đếm phân loại bưu kiện ca Đêm",
    description: "Quét mã vạch và phân loại kiện hàng nhẹ theo tuyến bưu cục giao sáng hôm sau.",
    work_type: "PART_TIME",
    shift_date: "Hôm nay",
    shift_start: "22:00",
    shift_end: "03:00",
    duration_hours: 5,
    period: "NIGHT",
    hourly_wage: 35000,
    total_budget: 175000,
    required_candidates: 3,
    filled_candidates: 1,
    is_sos: false,
    required_skills: ["Cẩn thận", "Sức khỏe tốt"],
    location_coords: {
      latitude: 21.565,
      longitude: 105.815,
    },
    location_address: "Khu công nghiệp Sông Công, Thái Nguyên",
    status: "OPEN",
    created_at: "2026-09-11T18:00:00Z",
  },
];

// 5. Cấu hình tìm kiếm mặc định cho sinh viên
export const DEFAULT_FILTER_CRITERIA: CandidateFilterCriteria = {
  hours_to_sell: 4, // Muốn bán 4 tiếng rảnh
  selected_periods: ["EVENING"], // Ca tối
  max_distance_km: 3.0, // Bán kính 3 km quanh trường TNUT
  min_hourly_rate: 25000, // 25.000đ/h
  selected_skills: ["Phục vụ bàn", "Pha chế cơ bản"],
  work_types: ["PART_TIME", "GIG"],
};
