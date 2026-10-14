// Test E2E Live API và Supabase Auth trên môi trường thực tế
async function runTests() {
  console.log("=================================================");
  console.log("🧪 SELLTIME PLATFORM - LIVE E2E VERIFICATION TEST");
  console.log("=================================================");

  // 1. Test GET /
  try {
    const resHome = await fetch("http://localhost:3000");
    console.log(`[Test 1] GET / (Trang chủ Sàn việc làm): Status = ${resHome.status} ${resHome.status === 200 ? "✅ PASS" : "❌ FAIL"}`);
  } catch (err) {
    console.error("[Test 1] GET / Error:", err.message);
  }

  // 2. Test GET /auth
  try {
    const resAuth = await fetch("http://localhost:3000/auth");
    console.log(`[Test 2] GET /auth (Cổng Supabase Auth): Status = ${resAuth.status} ${resAuth.status === 200 ? "✅ PASS" : "❌ FAIL"}`);
  } catch (err) {
    console.error("[Test 2] GET /auth Error:", err.message);
  }

  // 3. Test GET /api/auth/session (Chưa đăng nhập -> Phải trả về 401 an toàn)
  try {
    const resSession = await fetch("http://localhost:3000/api/auth/session");
    const sessionJson = await resSession.json();
    console.log(`[Test 3] GET /api/auth/session (Bảo mật session cookie): Status = ${resSession.status} ${resSession.status === 401 ? "✅ PASS (Chặn truy cập trái phép chuẩn)" : "❌ FAIL"}`);
    console.log(`         Phản hồi:`, JSON.stringify(sessionJson));
  } catch (err) {
    console.error("[Test 3] GET /api/auth/session Error:", err.message);
  }

  // 4. Test POST /api/auth/signup với Supabase Auth Cloud
  const randomSuffix = Math.floor(Date.now() / 1000);
  const testEmail = `candidate_test_${randomSuffix}@selltime.edu.vn`;
  try {
    const resSignup = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "http://localhost:3000"
      },
      body: JSON.stringify({
        email: testEmail,
        password: "CandidatePassword123!",
        full_name: "Nguyễn Văn Test QC"
      })
    });
    const signupJson = await resSignup.json();
    console.log(`[Test 4] POST /api/auth/signup (Đăng ký tài khoản Supabase Cloud): Status = ${resSignup.status}`);
    console.log(`         Email thử nghiệm: ${testEmail}`);
    console.log(`         Kết quả:`, JSON.stringify(signupJson));
    if (resSignup.status === 200 && signupJson.success === true && signupJson.confirmationRequired === true) {
      console.log(`         => ✅ PASS: Supabase đã nhận đăng ký và kích hoạt luồng gửi mail xác thực!`);
    } else {
      console.log(`         => ❌ FAIL`);
    }
  } catch (err) {
    console.error("[Test 4] POST /api/auth/signup Error:", err.message);
  }

  // 5. Test POST /api/auth/signup chống Origin giả mạo (CSRF protection)
  try {
    const resCsrf = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://attacker-site.com"
      },
      body: JSON.stringify({
        email: "hacker@attack.com",
        password: "AttackerPassword123!"
      })
    });
    console.log(`[Test 5] POST /api/auth/signup (Chống Origin giả mạo CSRF): Status = ${resCsrf.status} ${resCsrf.status === 403 ? "✅ PASS (Chặn 403 Forbidden chuẩn)" : "❌ FAIL"}`);
  } catch (err) {
    console.error("[Test 5] CSRF Error:", err.message);
  }

  // 6. Test POST /api/auth/forgot-password (Yêu cầu gửi mail đặt lại mật khẩu)
  try {
    const resForgot = await fetch("http://localhost:3000/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "http://localhost:3000"
      },
      body: JSON.stringify({
        email: "student_reset_demo@selltime.vn"
      })
    });
    const forgotJson = await resForgot.json();
    console.log(`[Test 6] POST /api/auth/forgot-password (Quên mật khẩu Supabase): Status = ${resForgot.status} ${resForgot.status === 200 && forgotJson.success ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`         Phản hồi:`, JSON.stringify(forgotJson));
  } catch (err) {
    console.error("[Test 6] Forgot password Error:", err.message);
  }

  console.log("=================================================");
  console.log("🏁 HOÀN TẤT KIỂM THỬ E2E LIVE API!");
  console.log("=================================================");
}

runTests();
