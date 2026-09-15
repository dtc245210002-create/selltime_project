import { NextResponse } from "next/server";
import { getShiftsFromSql, saveShiftToSql } from "@/infrastructure/database/sqlserver";
import { INITIAL_SHIFTS } from "@/application/store";
import { Shift } from "@/domain/types";

// In-memory cache cho runtime (đặc biệt khi chạy trên Vercel không có SQL Server local)
let memoryShifts: Shift[] = [...INITIAL_SHIFTS];

export async function GET() {
  try {
    // 1. Thử lấy từ SQL Server SellTimeDB
    const sqlShifts = await getShiftsFromSql();
    if (sqlShifts && sqlShifts.length > 0) {
      return NextResponse.json({ success: true, source: "sqlserver", data: sqlShifts });
    }
  } catch (err) {
    console.warn("Lỗi truy vấn SQL Server, fallback sang Memory:", err);
  }

  // 2. Fallback sang In-Memory Store
  return NextResponse.json({ success: true, source: "memory", data: memoryShifts });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newShift: Shift = body.shift;

    if (!newShift || !newShift.title || !newShift.total_budget) {
      return NextResponse.json(
        { success: false, error: "Dữ liệu ca làm không hợp lệ" },
        { status: 400 }
      );
    }

    // Luôn lưu vào memory cache
    memoryShifts = [newShift, ...memoryShifts];

    // Thử lưu vào SQL Server nếu có kết nối
    const savedToSql = await saveShiftToSql(newShift);

    return NextResponse.json({
      success: true,
      savedToSql,
      data: newShift,
    });
  } catch (err) {
    console.error("Lỗi tạo mới ca làm:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi hệ thống khi tạo ca làm" },
      { status: 500 }
    );
  }
}
