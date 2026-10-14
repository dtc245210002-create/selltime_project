import { ACCESS_COOKIE, authenticate, authConfig, authFailure, authResponse, cookieValue, createRequestClient, REFRESH_COOKIE, sessionCookies, verifyToken } from "@/infrastructure/auth/server";
import { AuthError, boundedString, readBody, requireOrigin, requireRole } from "@/infrastructure/auth/policy";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ action: string }> };

export async function GET(req: Request, context: Context) {
  try {
    if ((await context.params).action !== "session") throw new AuthError(404, "Không có thao tác này.");
    const { identity } = await authenticate(req);
    return authResponse({ success: true, identity });
  } catch (error) { return authFailure(error); }
}

export async function POST(req: Request, context: Context) {
  try {
    const { origin } = authConfig();
    requireOrigin(req, origin);
    const { action } = await context.params;
    if (action === "logout") {
      try {
        const { client, token } = await authenticate(req, true);
        // Thu hồi phía provider độc lập với việc dọn cookie của trình duyệt.
        const { error } = await client.auth.admin.signOut(token, "local");
        if (error) throw new AuthError(503, "Không thể kết thúc session.");
        return sessionCookies(authResponse({ success: true }), null);
      } catch (error) {
        // Session đã mất/hết hạn vẫn có thể logout cục bộ; lỗi provider được báo sau khi dọn cookie.
        const response = error instanceof AuthError && error.status === 401
          ? authResponse({ success: true }) : authFailure(error);
        return sessionCookies(response, null);
      }
    }
    if (action === "employer") {
      const { client, identity } = await authenticate(req, true);
      requireRole(identity, "ADMIN");
      const body = await readBody(req);
      const target = boundedString(body.user_id, 50, "Tài khoản");
      if (typeof body.enabled !== "boolean" || body.role !== undefined) throw new AuthError(403, "Chỉ được cấp hoặc thu hồi Employer.");
      const { error } = await client.rpc("set_employer_role", { target_user_id: target, enabled: body.enabled });
      if (error) throw new AuthError(error.code === "42501" ? 403 : 503, "Không thể thay đổi quyền Employer.");
      return authResponse({ success: true });
    }
    const client = createRequestClient();
    if (action === "refresh") {
      try {
        const refreshToken = cookieValue(req, REFRESH_COOKIE);
        if (!refreshToken || refreshToken.length > 16000) throw new AuthError(401, "Không có refresh session.");
        const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken });
        if (error || !data.session) throw new AuthError(401, "Session không hợp lệ.");
        const identity = await verifyToken(client, data.session.access_token);
        return sessionCookies(authResponse({ success: true, identity }), data.session);
      } catch (error) { return sessionCookies(authFailure(error), null); }
    }
    if (action === "forgot-password") {
      const body = await readBody(req);
      const email = boundedString(body.email, 120, "Email");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AuthError(400, "Email không hợp lệ.");
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth` });
      if (error) throw new AuthError(400, "Không thể gửi email khôi phục mật khẩu.");
      return authResponse({ success: true, message: `Email khôi phục mật khẩu đã được gửi tới ${email}.` });
    }
    if (action === "update-password") {
      const authorization = req.headers.get("authorization");
      const token = authorization ? /^Bearer ([^\s]+)$/.exec(authorization)?.[1] : cookieValue(req, ACCESS_COOKIE);
      if (!token) throw new AuthError(401, "Yêu cầu mã phiên khôi phục mật khẩu.");
      const body = await readBody(req);
      if (typeof body.password !== "string" || body.password.length < 8 || body.password.length > 128) {
        throw new AuthError(400, "Mật khẩu mới cần 8–128 ký tự.");
      }
      const tokenClient = createRequestClient(token);
      const { error } = await tokenClient.auth.updateUser({ password: body.password });
      if (error) throw new AuthError(400, "Không thể cập nhật mật khẩu.");
      return authResponse({ success: true, message: "Mật khẩu đã được cập nhật thành công." });
    }
    if (!["signup", "login"].includes(action)) throw new AuthError(404, "Không có thao tác này.");
    const body = await readBody(req);
    if (body.role !== undefined && body.role !== "CANDIDATE") throw new AuthError(403, "Đăng ký chỉ tạo Candidate.");
    const email = boundedString(body.email, 120, "Email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AuthError(400, "Email không hợp lệ.");
    if (typeof body.password !== "string" || body.password.length < 8 || body.password.length > 128) throw new AuthError(400, "Mật khẩu cần 8–128 ký tự.");
    const result = action === "signup"
      ? await client.auth.signUp({
          email,
          password: body.password,
          options: {
            data: { full_name: boundedString(body.full_name, 100, "Họ tên") },
            emailRedirectTo: `${origin}/auth`,
          },
        })
      : await client.auth.signInWithPassword({ email, password: body.password });
    if (result.error) throw new AuthError(action === "login" ? 401 : 400, "Không thể đăng nhập hoặc đăng ký với thông tin này.");
    if (!result.data.session) return authResponse({ success: true, confirmationRequired: true });
    const identity = await verifyToken(client, result.data.session.access_token);
    return sessionCookies(authResponse({ success: true, identity }), result.data.session);
  } catch (error) { return authFailure(error); }
}
