import type { SupabaseClient } from "@supabase/supabase-js";
import type { Shift, VerifiedIdentity } from "@/domain/types";
import { AuthError, requireOwner, requireRole } from "../auth/policy";

export async function getShiftsFromSupabase(client: SupabaseClient): Promise<Shift[]> {
  const { data, error } = await client.from("shifts").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw new AuthError(503, "Không thể tải ca làm.");
  return (data ?? []).map(row => ({ ...row, location_coords: { latitude: row.latitude, longitude: row.longitude } })) as Shift[];
}

// INSERT thay vì upsert: ID trùng không bao giờ ghi đè ownership.
export async function saveShiftToSupabase(client: SupabaseClient, identity: VerifiedIdentity, shift: Shift): Promise<Shift> {
  requireRole(identity, "EMPLOYER");
  requireOwner(identity, shift.employer_id);
  const row = {
    id: shift.id, employer_id: identity.userId, employer_name: identity.fullName,
    employer_avatar: identity.avatarUrl, title: shift.title, description: shift.description,
    cover_image: shift.cover_image, work_type: shift.work_type, shift_date: shift.shift_date,
    shift_start: shift.shift_start, shift_end: shift.shift_end, duration_hours: shift.duration_hours,
    period: shift.period, hourly_wage: shift.hourly_wage, total_budget: shift.total_budget,
    required_candidates: shift.required_candidates, filled_candidates: 0, is_sos: shift.is_sos,
    sos_bonus_amount: shift.sos_bonus_amount ?? 0, required_skills: shift.required_skills ?? [],
    store_perks: shift.store_perks ?? [], friendly_tags: shift.friendly_tags ?? [],
    latitude: shift.location_coords.latitude, longitude: shift.location_coords.longitude,
    location_address: shift.location_address, status: "OPEN", created_at: new Date().toISOString(),
  };
  const { data, error } = await client.from("shifts").insert(row).select().single();
  if (error) throw new AuthError(error.code === "23505" ? 409 : error.code === "42501" ? 403 : 503, error.code === "23505" ? "ID ca làm đã tồn tại." : "Không thể tạo ca làm.");
  return { ...data, location_coords: { latitude: data.latitude, longitude: data.longitude } } as Shift;
}
