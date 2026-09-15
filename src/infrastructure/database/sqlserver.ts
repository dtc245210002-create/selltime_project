import sql from "mssql";
import { Shift, User, CandidateProfile, EmployerProfile } from "@/domain/types";

// Cấu hình kết nối tới Microsoft SQL Server trên máy tính (LAPTOP-FLO3DB3M)
const sqlConfig: sql.config = {
  server: process.env.MSSQL_SERVER || "LAPTOP-FLO3DB3M",
  database: process.env.MSSQL_DATABASE || "SellTimeDB",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  // Sử dụng Windows Authentication khi chạy trên máy local
  driver: "msnodesqlv8",
  connectionTimeout: 5000,
  requestTimeout: 10000,
};

let pool: sql.ConnectionPool | null = null;

export async function getDbConnection() {
  try {
    if (pool && pool.connected) {
      return pool;
    }
    pool = await new sql.ConnectionPool({
      server: process.env.MSSQL_SERVER || "localhost",
      database: process.env.MSSQL_DATABASE || "SellTimeDB",
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }).connect();
    return pool;
  } catch (error) {
    // Không ném lỗi để tránh sập web khi chạy trên cloud Vercel
    console.warn("Không thể kết nối SQL Server local, tự động dùng bộ nhớ đệm (Mock Store):", error);
    return null;
  }
}

/**
 * Lấy danh sách ca làm việc từ bảng dbo.Shifts
 */
export async function getShiftsFromSql(): Promise<Shift[] | null> {
  const db = await getDbConnection();
  if (!db) return null;

  try {
    const result = await db.request().query("SELECT * FROM dbo.Shifts ORDER BY CreatedAt DESC");
    return result.recordset.map((row) => ({
      id: row.Id,
      employer_id: row.EmployerId,
      employer_name: row.EmployerName,
      employer_avatar: row.EmployerAvatar,
      title: row.Title,
      description: row.Description,
      work_type: row.WorkType,
      shift_date: row.ShiftDate,
      shift_start: row.ShiftStart,
      shift_end: row.ShiftEnd,
      duration_hours: row.DurationHours,
      period: row.Period,
      hourly_wage: row.HourlyWage,
      total_budget: row.TotalBudget,
      required_candidates: row.RequiredCandidates,
      filled_candidates: row.FilledCandidates,
      is_sos: row.IsSos,
      sos_bonus_amount: row.SosBonusAmount,
      required_skills: row.RequiredSkills ? JSON.parse(row.RequiredSkills) : [],
      location_coords: {
        latitude: row.Latitude,
        longitude: row.Longitude,
      },
      location_address: row.LocationAddress,
      status: row.Status,
      created_at: row.CreatedAt,
    }));
  } catch (err) {
    console.error("Lỗi truy vấn Shifts SQL Server:", err);
    return null;
  }
}

/**
 * Lưu ca làm việc mới vào bảng dbo.Shifts
 */
export async function saveShiftToSql(shift: Shift): Promise<boolean> {
  const db = await getDbConnection();
  if (!db) return false;

  try {
    const request = db.request();
    await request
      .input("Id", sql.NVarChar(50), shift.id)
      .input("EmployerId", sql.NVarChar(50), shift.employer_id)
      .input("EmployerName", sql.NVarChar(150), shift.employer_name)
      .input("EmployerAvatar", sql.NVarChar(500), shift.employer_avatar || "")
      .input("Title", sql.NVarChar(200), shift.title)
      .input("Description", sql.NVarChar(sql.MAX), shift.description)
      .input("WorkType", sql.NVarChar(20), shift.work_type)
      .input("ShiftDate", sql.NVarChar(50), shift.shift_date)
      .input("ShiftStart", sql.NVarChar(10), shift.shift_start)
      .input("ShiftEnd", sql.NVarChar(10), shift.shift_end)
      .input("DurationHours", sql.Float, shift.duration_hours)
      .input("Period", sql.NVarChar(20), shift.period)
      .input("HourlyWage", sql.Decimal(12, 2), shift.hourly_wage)
      .input("TotalBudget", sql.Decimal(12, 2), shift.total_budget)
      .input("RequiredCandidates", sql.Int, shift.required_candidates)
      .input("FilledCandidates", sql.Int, shift.filled_candidates)
      .input("IsSos", sql.Bit, shift.is_sos ? 1 : 0)
      .input("SosBonusAmount", sql.Decimal(12, 2), shift.sos_bonus_amount || 0)
      .input("RequiredSkills", sql.NVarChar(sql.MAX), JSON.stringify(shift.required_skills))
      .input("Latitude", sql.Float, shift.location_coords.latitude)
      .input("Longitude", sql.Float, shift.location_coords.longitude)
      .input("LocationAddress", sql.NVarChar(300), shift.location_address)
      .input("Status", sql.NVarChar(20), shift.status)
      .query(`
        INSERT INTO dbo.Shifts (
          Id, EmployerId, EmployerName, EmployerAvatar, Title, Description,
          WorkType, ShiftDate, ShiftStart, ShiftEnd, DurationHours, Period,
          HourlyWage, TotalBudget, RequiredCandidates, FilledCandidates,
          IsSos, SosBonusAmount, RequiredSkills, Latitude, Longitude,
          LocationAddress, Status, CreatedAt
        ) VALUES (
          @Id, @EmployerId, @EmployerName, @EmployerAvatar, @Title, @Description,
          @WorkType, @ShiftDate, @ShiftStart, @ShiftEnd, @DurationHours, @Period,
          @HourlyWage, @TotalBudget, @RequiredCandidates, @FilledCandidates,
          @IsSos, @SosBonusAmount, @RequiredSkills, @Latitude, @Longitude,
          @LocationAddress, @Status, GETDATE()
        )
      `);
    return true;
  } catch (err) {
    console.error("Lỗi lưu Shift vào SQL Server:", err);
    return false;
  }
}

