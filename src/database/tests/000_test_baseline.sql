-- Chỉ dùng project Supabase test THẬT, disposable, đã được duyệt riêng.
-- Script psql; chạy với ON_ERROR_STOP sau phê duyệt. Không chạy production.
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL search_path = public, extensions;
DO $$
DECLARE object_name TEXT;
BEGIN
  IF to_regclass('auth.users') IS NULL OR to_regprocedure('auth.uid()') IS NULL
     OR NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
     OR NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    RAISE EXCEPTION 'Cần auth.users/auth.uid()/roles Supabase thật; không mock';
  END IF;
  FOREACH object_name IN ARRAY ARRAY['users','candidate_profiles','employer_profiles','shifts','shift_applications','escrow_transactions','conversations','messages'] LOOP
    IF to_regclass('public.' || object_name) IS NOT NULL THEN
      RAISE EXCEPTION 'Từ chối bảng SellTime có sẵn: % (kể cả rỗng)', object_name;
    END IF;
  END LOOP;
  FOREACH object_name IN ARRAY ARRAY['user_role','work_type','shift_period','shift_status','application_status','escrow_type','escrow_status'] LOOP
    IF to_regtype('public.' || object_name) IS NOT NULL THEN
      RAISE EXCEPTION 'Từ chối enum SellTime có sẵn: %', object_name;
    END IF;
  END LOOP;
END $$;
-- BẮT ĐẦU DDL NỀN (nguyên văn nguồn trước section 10)
-- ====================================================================
-- SELL TIME PLATFORM - POSTGRESQL / SUPABASE SCHEMA
-- Khớp 100% với Clean Architecture Domain Entities & Tính năng Ca Gãy / Escrow / Pin Uy Tín
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('CANDIDATE', 'EMPLOYER', 'ADMIN');
CREATE TYPE work_type AS ENUM ('PART_TIME', 'GIG', 'INTERNSHIP');
CREATE TYPE shift_period AS ENUM ('MORNING', 'LUNCH', 'AFTERNOON', 'EVENING', 'NIGHT');
CREATE TYPE shift_status AS ENUM ('OPEN', 'FILLED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE application_status AS ENUM ('APPLIED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED');
CREATE TYPE escrow_type AS ENUM ('TOPUP', 'HELD', 'RELEASED', 'REFUNDED');
CREATE TYPE escrow_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- 3. BẢNG USERS (Người dùng hệ thống: Sinh viên & Chủ quán)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'CANDIDATE',
    avatar_url TEXT,
    kyc_id_number VARCHAR(20),
    is_kyc_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG CANDIDATE_PROFILES (Hồ sơ sinh viên bán thời gian)
CREATE TABLE IF NOT EXISTS candidate_profiles (
    user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    university VARCHAR(150) NOT NULL DEFAULT 'ĐH Kỹ thuật Công nghiệp (TNUT)',
    trust_battery INT NOT NULL DEFAULT 100 CHECK (trust_battery >= 0 AND trust_battery <= 100),
    hourly_rate_min INT NOT NULL DEFAULT 25000,
    skills JSONB NOT NULL DEFAULT '["Phục vụ bàn", "Pha chế cơ bản", "Thu ngân POS", "Giao tiếp"]'::jsonb,
    weekly_availability JSONB NOT NULL DEFAULT '{
        "MONDAY": ["EVENING"],
        "TUESDAY": ["AFTERNOON", "EVENING"],
        "WEDNESDAY": ["EVENING"],
        "THURSDAY": ["MORNING", "LUNCH"],
        "FRIDAY": ["EVENING", "NIGHT"],
        "SATURDAY": ["MORNING", "LUNCH", "AFTERNOON", "EVENING", "NIGHT"],
        "SUNDAY": ["MORNING", "LUNCH", "AFTERNOON", "EVENING"]
    }'::jsonb,
    latitude DOUBLE PRECISION NOT NULL DEFAULT 21.5855,
    longitude DOUBLE PRECISION NOT NULL DEFAULT 105.8272,
    location_address VARCHAR(255) NOT NULL DEFAULT 'Ký túc xá K1, ĐH Kỹ thuật Công nghiệp, TP. Thái Nguyên',
    total_shifts_completed INT DEFAULT 0,
    party_streak INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BẢNG EMPLOYER_PROFILES (Hồ sơ chủ cơ sở / Doanh nghiệp F&B)
CREATE TABLE IF NOT EXISTS employer_profiles (
    user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    business_type VARCHAR(50) NOT NULL DEFAULT 'FNB',
    address VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL DEFAULT 21.593,
    longitude DOUBLE PRECISION NOT NULL DEFAULT 105.834,
    verified_badge BOOLEAN DEFAULT TRUE,
    checkin_pin VARCHAR(10) DEFAULT '8866',
    escrow_balance INT DEFAULT 1250000,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BẢNG SHIFTS (Danh sách ca làm việc tiêu chuẩn & ca gãy micro-shifts)
CREATE TABLE IF NOT EXISTS shifts (
    id VARCHAR(50) PRIMARY KEY,
    employer_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employer_name VARCHAR(150) NOT NULL,
    employer_avatar TEXT,
    cover_image TEXT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    work_type work_type NOT NULL DEFAULT 'PART_TIME',
    shift_date VARCHAR(50) NOT NULL DEFAULT 'Hôm nay',
    shift_start VARCHAR(10) NOT NULL, -- '11:00'
    shift_end VARCHAR(10) NOT NULL,   -- '13:30'
    duration_hours DOUBLE PRECISION NOT NULL DEFAULT 4.0,
    period shift_period NOT NULL DEFAULT 'EVENING',
    hourly_wage INT NOT NULL DEFAULT 30000,
    total_budget INT NOT NULL DEFAULT 120000,
    required_candidates INT NOT NULL DEFAULT 1,
    filled_candidates INT NOT NULL DEFAULT 0,
    is_sos BOOLEAN NOT NULL DEFAULT FALSE,
    sos_bonus_amount INT NOT NULL DEFAULT 0,
    required_skills JSONB DEFAULT '["Phục vụ bàn"]'::jsonb,
    store_perks JSONB DEFAULT '["Bao ăn bữa ca", "Nhận tiền ngay qua Escrow"]'::jsonb,
    friendly_tags JSONB DEFAULT '["⚡ Ca gãy SV", "Lương ngay"]'::jsonb,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_address VARCHAR(255) NOT NULL,
    status shift_status NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BẢNG SHIFT_APPLICATIONS (Ứng tuyển, Check-in GPS, Checkout & Hủy ân hạn 1h)
CREATE TABLE IF NOT EXISTS shift_applications (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'app_' || replace(uuid_generate_v4()::text, '-', ''),
    shift_id VARCHAR(50) NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    candidate_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status application_status NOT NULL DEFAULT 'APPLIED',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    checkin_at TIMESTAMPTZ,
    checkout_at TIMESTAMPTZ,
    checkin_lat DOUBLE PRECISION,
    checkin_lng DOUBLE PRECISION,
    checkin_method VARCHAR(20), -- 'GPS', 'PIN', 'QR'
    cancellation_reason TEXT,
    cancellation_penalty_points INT DEFAULT 0,
    is_grace_period_cancellation BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ
);

-- 8. BẢNG ESCROW_TRANSACTIONS (Sổ quỹ bảo đảm tiền lương tự động VietQR PayOS)
CREATE TABLE IF NOT EXISTS escrow_transactions (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'tx_' || replace(uuid_generate_v4()::text, '-', ''),
    code VARCHAR(50) NOT NULL UNIQUE,
    shift_id VARCHAR(50) REFERENCES shifts(id) ON DELETE SET NULL,
    employer_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    candidate_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    type escrow_type NOT NULL DEFAULT 'HELD',
    title VARCHAR(200) NOT NULL,
    detail TEXT,
    amount INT NOT NULL,
    payos_order_code VARCHAR(50),
    status escrow_status NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CHỈ MỤC TỐI ƯU HIỆU NĂNG TÌM KIẾM (INDEXES)
CREATE INDEX IF NOT EXISTS idx_shifts_status_period ON shifts(status, period);
CREATE INDEX IF NOT EXISTS idx_shifts_employer ON shifts(employer_id);
CREATE INDEX IF NOT EXISTS idx_applications_shift_candidate ON shift_applications(shift_id, candidate_id);
CREATE INDEX IF NOT EXISTS idx_escrow_employer ON escrow_transactions(employer_id);

-- KẾT THÚC DDL NỀN
COMMIT;
