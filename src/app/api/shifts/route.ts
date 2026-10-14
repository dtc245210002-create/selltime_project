import { getShiftsFromSupabase, saveShiftToSupabase } from "@/infrastructure/database/supabaseRepo";
import { authenticate, authFailure, authResponse } from "@/infrastructure/auth/server";
import { AuthError, boundedString, readBody, requireOwner, requireRole } from "@/infrastructure/auth/policy";
import type { Shift } from "@/domain/types";

export const dynamic = "force-dynamic";
const MAX_MONEY = 2147483647;
const isTime = (value: unknown) => typeof value === "string" && value.length === 5 && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
export async function GET(req: Request) {
  try {
    const { client } = await authenticate(req);
    return authResponse({ success: true, source: "supabase", data: await getShiftsFromSupabase(client) });
  } catch (error) { return authFailure(error); }
}

export async function POST(req: Request) {
  try {
    const { client, identity } = await authenticate(req, true);
    requireRole(identity, "EMPLOYER");
    const body = await readBody(req);
    const shift = body.shift as Shift;
    if (!shift || typeof shift !== "object") throw new AuthError(400, "Ca làm không hợp lệ.");
    requireOwner(identity, shift.employer_id);
    boundedString(shift.id, 50, "ID"); boundedString(shift.title, 200, "Tiêu đề");
    boundedString(shift.location_address, 255, "Địa chỉ"); boundedString(shift.shift_date, 50, "Ngày");
    if (!["PART_TIME", "GIG", "INTERNSHIP"].includes(shift.work_type) ||
      !["MORNING", "LUNCH", "AFTERNOON", "EVENING", "NIGHT"].includes(shift.period) ||
      !isTime(shift.shift_start) || !isTime(shift.shift_end) ||
      !Number.isFinite(shift.duration_hours) || shift.duration_hours <= 0 || shift.duration_hours > 24 ||
      !Number.isSafeInteger(shift.hourly_wage) || shift.hourly_wage <= 0 || shift.hourly_wage > MAX_MONEY ||
      !Number.isSafeInteger(shift.total_budget) || shift.total_budget <= 0 || shift.total_budget > MAX_MONEY ||
      !Number.isSafeInteger(shift.required_candidates) || shift.required_candidates < 1 || shift.required_candidates > 100 ||
      typeof shift.is_sos !== "boolean" ||
      !Number.isFinite(shift.location_coords?.latitude) || Math.abs(shift.location_coords.latitude) > 90 ||
      !Number.isFinite(shift.location_coords?.longitude) || Math.abs(shift.location_coords.longitude) > 180) throw new AuthError(400, "Ca làm không hợp lệ.");
    for (const list of [shift.required_skills, shift.store_perks, shift.friendly_tags]) {
      if (list !== undefined && (!Array.isArray(list) || list.length > 30 || list.some(v => typeof v !== "string" || v.length > 200))) throw new AuthError(400, "Danh sách ca làm không hợp lệ.");
    }
    if ((shift.description?.length ?? 0) > 5000 || (shift.sos_bonus_amount !== undefined && (!Number.isSafeInteger(shift.sos_bonus_amount) || shift.sos_bonus_amount < 0 || shift.sos_bonus_amount > MAX_MONEY))) throw new AuthError(400, "Ca làm không hợp lệ.");
    return authResponse({ success: true, data: await saveShiftToSupabase(client, identity, shift) }, 201);
  } catch (error) { return authFailure(error); }
}
