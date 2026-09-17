// ==========================================================
// SELL TIME PLATFORM - DOMAIN ENTITIES & TYPES
// Khớp 100% với tài liệu kiến trúc kỹ thuật & ERD
// ==========================================================

export type UserRole = "CANDIDATE" | "EMPLOYER" | "ADMIN";

export type WorkType = "PART_TIME" | "FULL_TIME" | "GIG";

export type ShiftPeriod = "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";

export type ShiftStatus = "OPEN" | "FILLED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  kyc_id_number?: string;
  is_kyc_verified: boolean;
  created_at: string;
}

export interface CandidateProfile {
  user_id: string;
  bio: string;
  university: string;
  trust_battery: number; // Mặc định 100, min 0, max 100 (PartyMode)
  hourly_rate_min: number; // VNĐ/h
  skills: string[];
  location_coords: GeoPoint;
  location_address: string;
}

export interface EmployerProfile {
  user_id: string;
  company_name: string;
  business_type: "FNB" | "RETAIL" | "LOGISTICS" | "OTHER";
  address: string;
  location_coords: GeoPoint;
  verified_badge: boolean;
}

export interface AvailabilitySlot {
  id: string;
  day_of_week: number; // 1 = T2, 2 = T3, ..., 7 = CN
  start_time: string; // "18:00"
  end_time: string; // "22:00"
  period: ShiftPeriod;
}

export interface Shift {
  id: string;
  employer_id: string;
  employer_name: string;
  employer_avatar?: string;
  title: string;
  description: string;
  work_type: WorkType;
  shift_date: string; // "2026-09-12"
  shift_start: string; // "18:00"
  shift_end: string; // "22:00"
  duration_hours: number;
  period: ShiftPeriod;
  hourly_wage: number; // VNĐ/h
  total_budget: number;
  required_candidates: number;
  filled_candidates: number;
  is_sos: boolean;
  sos_bonus_amount?: number;
  required_skills: string[];
  cover_image?: string;
  store_perks?: string[];
  friendly_tags?: string[];
  location_coords: GeoPoint;
  location_address: string;
  status: ShiftStatus;
  created_at: string;
}

export interface CandidateFilterCriteria {
  hours_to_sell: number; // Số giờ muốn bán (1 - 12)
  selected_periods: ShiftPeriod[]; // Khung giờ trong ngày
  max_distance_km: number; // Bán kính di chuyển (0.5 - 15 km)
  min_hourly_rate: number; // Mức lương sàn kỳ vọng
  selected_skills: string[];
  work_types: WorkType[];
  search_keyword?: string;
}

export interface MatchBreakdown {
  time_score: number; // S_Time (0 - 100)
  location_score: number; // S_Location (0 - 100)
  skill_score: number; // S_Skill (0 - 100)
  salary_score: number; // S_Salary (0 - 100)
  total_score: number; // Matching Score tổng hợp (0 - 100)
  distance_km: number;
  duration_hours: number;
  badge_color: "green" | "blue" | "yellow" | "gray";
  badge_label: string;
}

export interface ShiftWithMatch extends Shift {
  match: MatchBreakdown;
}
