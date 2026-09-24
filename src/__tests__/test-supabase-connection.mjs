import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Đọc .env.local
const envFile = fs.readFileSync(".env.local", "utf8");
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : "";
const supabaseAnonKey = keyMatch ? keyMatch[1].trim() : "";

console.log("🔍 Đang kiểm tra kết nối Supabase...");
console.log("📍 URL:", supabaseUrl);
console.log("🔑 Key:", supabaseAnonKey.substring(0, 15) + "...");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Chưa cấu hình đầy đủ URL hoặc Anon Key trong .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // 1. Kiểm tra bảng shifts
    const { data: shifts, error: shiftError } = await supabase
      .from("shifts")
      .select("id, title, hourly_wage, total_budget, status");

    if (shiftError) {
      console.error("❌ Lỗi truy vấn bảng shifts:", shiftError.message);
      return;
    }

    console.log("✅ KẾT NỐI SUPABASE THÀNH CÔNG RỰC RỠ!");
    console.log(`📊 Tìm thấy ${shifts.length} ca làm việc trong cơ sở dữ liệu:`);
    shifts.forEach((s, idx) => {
      console.log(`   ${idx + 1}. [${s.id}] ${s.title} (${s.hourly_wage.toLocaleString("vi-VN")} đ/h) - Status: ${s.status}`);
    });

    // 2. Kiểm tra bảng users
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, full_name, email, role");

    if (!userError && users) {
      console.log(`👥 Tìm thấy ${users.length} người dùng:`);
      users.forEach((u) => {
        console.log(`   • ${u.full_name} (${u.role}) - ${u.email}`);
      });
    }
  } catch (err) {
    console.error("❌ Exception khi kết nối:", err);
  }
}

testConnection();
