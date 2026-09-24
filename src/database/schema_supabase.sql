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

-- 10. DỮ LIỆU MẪU BAN ĐẦU (SEED DATA THÁI NGUYÊN)
INSERT INTO users (id, email, phone, full_name, role, avatar_url, kyc_id_number, is_kyc_verified)
VALUES 
('user_cand_huy_01', 'huy.tnut@gmail.com', '0987654321', 'Nguyễn Đức Huy', 'CANDIDATE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '019283746512', true),
('user_emp_lan_02', 'lan.thecuppa@gmail.com', '0912345678', 'Hoàng Thị Lan', 'EMPLOYER', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', '020192837465', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO candidate_profiles (user_id, bio, university, trust_battery, hourly_rate_min, skills, latitude, longitude, location_address)
VALUES 
('user_cand_huy_01', 'Sinh viên năm 3 ĐH Kỹ thuật Công nghiệp (TNUT), có kinh nghiệm phục vụ bàn và pha chế.', 'ĐH Kỹ thuật Công nghiệp (TNUT)', 100, 25000, '["Phục vụ bàn", "Pha chế cơ bản", "Thu ngân POS", "Giao tiếp"]'::jsonb, 21.5855, 105.8272, 'Ký túc xá K1, ĐH Kỹ thuật Công nghiệp, TP. Thái Nguyên')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO employer_profiles (user_id, company_name, business_type, address, latitude, longitude, verified_badge, checkin_pin, escrow_balance)
VALUES 
('user_emp_lan_02', 'The Cuppa Coffee & Tea', 'FNB', 'Số 142 Đường Hoàng Văn Thụ, TP. Thái Nguyên', 21.593, 105.834, true, '8866', 1250000)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO shifts (
    id, employer_id, employer_name, employer_avatar, cover_image, title, description,
    work_type, shift_date, shift_start, shift_end, duration_hours, period, hourly_wage,
    total_budget, required_candidates, filled_candidates, is_sos, sos_bonus_amount,
    required_skills, store_perks, friendly_tags, latitude, longitude, location_address, status
)
VALUES 
(
    'shift_sos_01', 'user_emp_lan_02', 'The Cuppa Coffee & Tea',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600',
    '🚨 GẤP: Pha chế & Phục vụ nước ca tối (Nhận ngay)',
    'Cần 1 bạn sinh viên nhanh nhẹn hỗ trợ pha chế và bưng bê ca tối do nhân viên cũ bị ốm. Thưởng nóng SOS +30.000đ nhận liền sau ca qua Escrow.',
    'PART_TIME', 'Hôm nay', '18:00', '22:00', 4.0, 'EVENING', 32000, 158000, 1, 0, true, 30000,
    '["Pha chế cơ bản", "Phục vụ bàn"]'::jsonb,
    '["Thưởng nóng SOS 30k", "Miễn phí 1 ly nước uống ca làm", "Nhận tiền ngay sau khi check-out"]'::jsonb,
    '["🚨 SOS Khẩn Cấp", "Bao nước uống", "Lương ngay"]'::jsonb,
    21.593, 105.834, '142 Hoàng Văn Thụ, TP. Thái Nguyên', 'OPEN'
),
(
    'shift_gap_01', 'user_emp_lan_02', 'Bếp Cơm TNUT (Cổng Ký túc xá)',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
    '🍜 Phục vụ ca gãy trưa cao điểm (11h00 - 13h30)',
    'Ca gãy siêu tiện lợi cho sinh viên TNUT: 2.5 tiếng giờ nghỉ trưa giữa các tiết học. Bao ăn cơm trưa miễn phí tại quán.',
    'PART_TIME', 'Hôm nay', '11:00', '13:30', 2.5, 'LUNCH', 35000, 87500, 2, 0, false, 0,
    '["Phục vụ bàn", "Nhanh nhẹn"]'::jsonb,
    '["Bao ăn trưa miễn phí", "Thời gian linh hoạt theo tiết học", "Tiền tươi qua QR"]'::jsonb,
    '["⚡ Ca gãy trưa 2.5h", "Bao cơm trưa", "Sát vách KTX"]'::jsonb,
    21.5862, 105.8285, 'Số 18 Đường 3/2, đối diện Cổng KTX TNUT, TP. Thái Nguyên', 'OPEN'
),
(
    'shift_gap_02', 'user_emp_lan_02', 'Lẩu Nướng BBQ TNUT',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=100',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
    '🌙 Phụ bếp & Nướng bàn ca gãy tối (17h30 - 20h30)',
    'Hỗ trợ sơ chế rau củ, châm than và bưng đồ nướng trong 3 tiếng cao điểm ăn tối. Bao ăn bữa tối no nê sau ca.',
    'PART_TIME', 'Hôm nay', '17:30', '20:30', 3.0, 'EVENING', 33000, 99000, 2, 0, false, 0,
    '["Phụ bếp", "Bưng bê", "Nhiệt tình"]'::jsonb,
    '["Bao bữa tối lẩu nướng", "Không yêu cầu kinh nghiệm", "Nhận tiền tức thì"]'::jsonb,
    '["⚡ Ca gãy tối 3h", "Bao ăn tối", "Tiền liền tay"]'::jsonb,
    21.5878, 105.826, 'Số 45 Đường Ga Thái Nguyên, TP. Thái Nguyên', 'OPEN'
)
ON CONFLICT (id) DO NOTHING;
