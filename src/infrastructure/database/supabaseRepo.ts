import { getSupabaseClient } from "./supabaseClient";
import { Shift } from "@/domain/types";

/**
 * Lấy danh sách ca làm việc từ Supabase PostgreSQL
 */
export async function getShiftsFromSupabase(): Promise<Shift[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Lỗi Supabase getShifts:", error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    // Chuyển đổi từ schema Supabase sang Domain Entity Shift
    return data.map((row: any) => ({
      id: row.id,
      employer_id: row.employer_id,
      employer_name: row.employer_name,
      employer_avatar: row.employer_avatar,
      cover_image: row.cover_image,
      title: row.title,
      description: row.description,
      work_type: row.work_type,
      shift_date: row.shift_date,
      shift_start: row.shift_start,
      shift_end: row.shift_end,
      duration_hours: Number(row.duration_hours),
      period: row.period,
      hourly_wage: Number(row.hourly_wage),
      total_budget: Number(row.total_budget),
      required_candidates: Number(row.required_candidates),
      filled_candidates: Number(row.filled_candidates),
      is_sos: Boolean(row.is_sos),
      sos_bonus_amount: Number(row.sos_bonus_amount || 0),
      required_skills: Array.isArray(row.required_skills)
        ? row.required_skills
        : JSON.parse(row.required_skills || "[]"),
      store_perks: Array.isArray(row.store_perks)
        ? row.store_perks
        : JSON.parse(row.store_perks || "[]"),
      friendly_tags: Array.isArray(row.friendly_tags)
        ? row.friendly_tags
        : JSON.parse(row.friendly_tags || "[]"),
      location_coords: {
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
      },
      location_address: row.location_address,
      status: row.status,
      created_at: row.created_at,
    }));
  } catch (err) {
    console.warn("Exception getShiftsFromSupabase:", err);
    return null;
  }
}

/**
 * Lưu ca làm mới vào Supabase PostgreSQL
 */
export async function saveShiftToSupabase(shift: Shift): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("shifts").upsert({
      id: shift.id,
      employer_id: shift.employer_id,
      employer_name: shift.employer_name,
      employer_avatar: shift.employer_avatar,
      cover_image: shift.cover_image,
      title: shift.title,
      description: shift.description,
      work_type: shift.work_type,
      shift_date: shift.shift_date,
      shift_start: shift.shift_start,
      shift_end: shift.shift_end,
      duration_hours: shift.duration_hours,
      period: shift.period,
      hourly_wage: shift.hourly_wage,
      total_budget: shift.total_budget,
      required_candidates: shift.required_candidates,
      filled_candidates: shift.filled_candidates,
      is_sos: shift.is_sos,
      sos_bonus_amount: shift.sos_bonus_amount || 0,
      required_skills: shift.required_skills || [],
      store_perks: shift.store_perks || [],
      friendly_tags: shift.friendly_tags || [],
      latitude: shift.location_coords.latitude,
      longitude: shift.location_coords.longitude,
      location_address: shift.location_address,
      status: shift.status,
      created_at: shift.created_at || new Date().toISOString(),
    });

    if (error) {
      console.warn("Lỗi saveShiftToSupabase:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Exception saveShiftToSupabase:", err);
    return false;
  }
}
