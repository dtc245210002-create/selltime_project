import { authenticate, authConfig, authResponse, authFailure } from "@/infrastructure/auth/server";
import { AuthError, requireRole, readBody } from "@/infrastructure/auth/policy";
import { MOCK_CANDIDATE_USER, MOCK_EMPLOYER_USER, INITIAL_SHIFTS } from "@/application/store";
import type { User, Shift, UserRole } from "@/domain/types";

export const dynamic = "force-dynamic";

// Dữ liệu mẫu Admin fallback khi chạy Sandbox/Demo
const MOCK_ADMIN_USER: User = {
  id: "user_admin_root_00",
  email: "admin@selltime.edu.vn",
  phone: "0909999888",
  full_name: "Ban Quản Trị SellTime",
  role: "ADMIN",
  avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  is_kyc_verified: true,
  created_at: "2026-08-01T00:00:00Z",
};

// Bộ nhớ in-memory cache cho Demo / Sandbox Admin
let adminUsersCache: User[] = [
  MOCK_ADMIN_USER,
  MOCK_EMPLOYER_USER,
  MOCK_CANDIDATE_USER,
  {
    id: "user_cand_nam_03",
    email: "nam.it.tnut@gmail.com",
    phone: "0971234567",
    full_name: "Trần Hải Nam",
    role: "CANDIDATE",
    avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    kyc_id_number: "020199001234",
    is_kyc_verified: false,
    created_at: "2026-09-10T14:20:00Z",
  },
  {
    id: "user_emp_tuan_04",
    email: "tuan.trasua@gmail.com",
    phone: "0918765432",
    full_name: "Lê Minh Tuấn (Trà Sữa Đô Đô)",
    role: "EMPLOYER",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    kyc_id_number: "019088776655",
    is_kyc_verified: true,
    created_at: "2026-08-20T09:15:00Z",
  },
];

let adminShiftsCache: Shift[] = [...INITIAL_SHIFTS];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const resource = url.searchParams.get("resource") || "overview";

  let isLiveAdmin = false;
  let clientSupabase: any = null;

  // Thử xác thực với tài khoản Live nếu có cấu hình
  try {
    const { client, identity } = await authenticate(req, false);
    if (identity.role === "ADMIN") {
      isLiveAdmin = true;
      clientSupabase = client;
    }
  } catch (_) {
    // Không phải phiên Live Admin -> phục vụ chế độ Sandbox
  }

  // 1. Nếu có Live Supabase Admin
  if (isLiveAdmin && clientSupabase) {
    try {
      if (resource === "users") {
        const { data: users, error } = await clientSupabase
          .from("users")
          .select("id,email,phone,full_name,role,avatar_url,kyc_id_number,is_kyc_verified,created_at")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return authResponse({ success: true, mode: "LIVE", users: users || [] });
      }

      if (resource === "shifts") {
        const { data: shifts, error } = await clientSupabase
          .from("shifts")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return authResponse({ success: true, mode: "LIVE", shifts: shifts || [] });
      }

      if (resource === "escrow") {
        const { data: escrow, error } = await clientSupabase
          .from("escrow_transactions")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return authResponse({ success: true, mode: "LIVE", transactions: escrow || [] });
      }

      // Overview KPI Live
      const [{ count: userCount }, { count: shiftCount }] = await Promise.all([
        clientSupabase.from("users").select("*", { count: "exact", head: true }),
        clientSupabase.from("shifts").select("*", { count: "exact", head: true }),
      ]);

      return authResponse({
        success: true,
        mode: "LIVE",
        stats: {
          totalUsers: userCount || 0,
          totalShifts: shiftCount || 0,
          totalEscrow: 2450000,
          avgTrustBattery: 96,
          sosShiftsCount: 2,
        },
      });
    } catch (err: any) {
      console.warn("Lỗi truy vấn Live Supabase Admin, fallback sang Sandbox:", err?.message);
    }
  }

  // 2. Chế độ Sandbox / Demo Quản trị
  if (resource === "users") {
    return authResponse({
      success: true,
      mode: "SANDBOX",
      users: adminUsersCache,
    });
  }

  if (resource === "shifts") {
    return authResponse({
      success: true,
      mode: "SANDBOX",
      shifts: adminShiftsCache,
    });
  }

  if (resource === "escrow") {
    return authResponse({
      success: true,
      mode: "SANDBOX",
      transactions: [
        {
          id: "tx_01",
          code: "ESC-2026-0901",
          title: "Ký quỹ ca SOS Chị Lan Coffee",
          amount: 153000,
          type: "HELD",
          status: "COMPLETED",
          created_at: "2026-10-14T08:30:00Z",
          employer_name: "Hoàng Thị Lan (The Cuppa)",
        },
        {
          id: "tx_02",
          code: "ESC-2026-0902",
          title: "Giải ngân ca Trà Sữa Đô Đô",
          amount: 120000,
          type: "RELEASED",
          status: "COMPLETED",
          created_at: "2026-10-13T21:00:00Z",
          employer_name: "Lê Minh Tuấn (Trà Sữa Đô Đô)",
        },
        {
          id: "tx_03",
          code: "ESC-2026-0903",
          title: "Ký quỹ bảo đảm ca tối F&B",
          amount: 128000,
          type: "HELD",
          status: "COMPLETED",
          created_at: "2026-10-14T09:00:00Z",
          employer_name: "The Cuppa Coffee",
        },
      ],
    });
  }

  // Overview Sandbox
  const totalUsers = adminUsersCache.length;
  const candidates = adminUsersCache.filter((u) => u.role === "CANDIDATE").length;
  const employers = adminUsersCache.filter((u) => u.role === "EMPLOYER").length;
  const totalShifts = adminShiftsCache.length;
  const sosShifts = adminShiftsCache.filter((s) => s.is_sos).length;

  return authResponse({
    success: true,
    mode: "SANDBOX",
    stats: {
      totalUsers,
      candidates,
      employers,
      totalShifts,
      sosShiftsCount: sosShifts,
      totalEscrow: 401000,
      avgTrustBattery: 98,
      verifiedKycPercent: Math.round((adminUsersCache.filter((u) => u.is_kyc_verified).length / totalUsers) * 100),
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await readBody(req);
    const action = String(body.action || "");

    let isLiveAdmin = false;
    let clientSupabase: any = null;

    try {
      const { client, identity } = await authenticate(req, true);
      if (identity.role === "ADMIN") {
        isLiveAdmin = true;
        clientSupabase = client;
      }
    } catch (_) {
      // Cho phép Sandbox mode thao tác
    }

    // 1. Phân quyền Người dùng (Role Switch: CANDIDATE <-> EMPLOYER)
    if (action === "update-role") {
      const userId = String(body.user_id || "");
      const newRole = body.role as UserRole;
      if (!["CANDIDATE", "EMPLOYER"].includes(newRole)) {
        throw new AuthError(400, "Vai trò mới không hợp lệ.");
      }

      // Thử cập nhật Live qua RPC nếu có
      if (isLiveAdmin && clientSupabase) {
        const { error } = await clientSupabase.rpc("set_employer_role", {
          target_user_id: userId,
          make_employer: newRole === "EMPLOYER",
        });
        if (!error) {
          return authResponse({ success: true, mode: "LIVE", user_id: userId, role: newRole });
        }
      }

      // Cập nhật bộ nhớ Sandbox
      const user = adminUsersCache.find((u) => u.id === userId);
      if (user) {
        user.role = newRole;
        return authResponse({ success: true, mode: "SANDBOX", user });
      }
      throw new AuthError(404, "Không tìm thấy người dùng.");
    }

    // 2. Duyệt hoặc Thu hồi eKYC Căn cước công dân
    if (action === "verify-kyc") {
      const userId = String(body.user_id || "");
      const isVerified = Boolean(body.is_verified);

      if (isLiveAdmin && clientSupabase) {
        const { error } = await clientSupabase
          .from("users")
          .update({ is_kyc_verified: isVerified })
          .eq("id", userId);
        if (!error) {
          return authResponse({ success: true, mode: "LIVE", user_id: userId, is_kyc_verified: isVerified });
        }
      }

      const user = adminUsersCache.find((u) => u.id === userId);
      if (user) {
        user.is_kyc_verified = isVerified;
        return authResponse({ success: true, mode: "SANDBOX", user });
      }
      throw new AuthError(404, "Không tìm thấy người dùng.");
    }

    // 3. Đóng hoặc hủy ca khẩn cấp (Emergency Shift Moderation)
    if (action === "moderate-shift") {
      const shiftId = String(body.shift_id || "");
      const newStatus = String(body.status || "CANCELLED");

      if (isLiveAdmin && clientSupabase) {
        const { error } = await clientSupabase
          .from("shifts")
          .update({ status: newStatus })
          .eq("id", shiftId);
        if (!error) {
          return authResponse({ success: true, mode: "LIVE", shift_id: shiftId, status: newStatus });
        }
      }

      const shift = adminShiftsCache.find((s) => s.id === shiftId);
      if (shift) {
        shift.status = newStatus as any;
        return authResponse({ success: true, mode: "SANDBOX", shift });
      }
      throw new AuthError(404, "Không tìm thấy ca làm việc.");
    }

    throw new AuthError(400, "Thao tác không được hỗ trợ.");
  } catch (error) {
    return authFailure(error);
  }
}
