-- ====================================================================
-- SELL TIME PLATFORM - T-SQL SCHEMA FOR MICROSOFT SQL SERVER
-- Server: LAPTOP-FLO3DB3M (MSSQLSERVER)
-- Khớp 100% với tài liệu kiến trúc kỹ thuật của dự án Sell Time
-- ====================================================================

-- 1. Tạo Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SellTimeDB')
BEGIN
    CREATE DATABASE SellTimeDB;
END
GO

USE SellTimeDB;
GO

-- 2. Bảng USERS (Người dùng chung: Sinh viên & Nhà tuyển dụng)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE Users (
        Id NVARCHAR(50) PRIMARY KEY,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        Phone NVARCHAR(20) NOT NULL,
        FullName NVARCHAR(100) NOT NULL,
        Role NVARCHAR(20) NOT NULL, -- 'CANDIDATE', 'EMPLOYER', 'ADMIN'
        AvatarUrl NVARCHAR(500) NULL,
        KycIdNumber NVARCHAR(20) NULL, -- CCCD định danh
        IsKycVerified BIT DEFAULT 0,
        CreatedAt DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- 3. Bảng CANDIDATE_PROFILES (Hồ sơ sinh viên bán thời gian)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CandidateProfiles]') AND type in (N'U'))
BEGIN
    CREATE TABLE CandidateProfiles (
        UserId NVARCHAR(50) PRIMARY KEY FOREIGN KEY REFERENCES Users(Id) ON DELETE CASCADE,
        Bio NVARCHAR(500) NULL,
        University NVARCHAR(150) NOT NULL, -- 'TNUT', 'ĐH Sư Phạm Thái Nguyên', ...
        TrustBattery INT DEFAULT 100,      -- Pin uy tín PartyMode (0 - 100)
        HourlyRateMin INT DEFAULT 25000,    -- Mức lương sàn kỳ vọng (VNĐ/h)
        Skills NVARCHAR(MAX) NULL,          -- Danh sách kỹ năng lưu dạng JSON hoặc text
        Latitude FLOAT NOT NULL,            -- Tọa độ KTX / Nhà trọ
        Longitude FLOAT NOT NULL,
        LocationAddress NVARCHAR(255) NOT NULL
    );
END
GO

-- 4. Bảng EMPLOYER_PROFILES (Hồ sơ chủ quán / Nhà tuyển dụng F&B)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EmployerProfiles]') AND type in (N'U'))
BEGIN
    CREATE TABLE EmployerProfiles (
        UserId NVARCHAR(50) PRIMARY KEY FOREIGN KEY REFERENCES Users(Id) ON DELETE CASCADE,
        CompanyName NVARCHAR(150) NOT NULL,
        BusinessType NVARCHAR(50) DEFAULT 'FNB', -- 'FNB', 'RETAIL', 'LOGISTICS'
        Address NVARCHAR(255) NOT NULL,
        Latitude FLOAT NOT NULL,
        Longitude FLOAT NOT NULL,
        VerifiedBadge BIT DEFAULT 1
    );
END
GO

-- 5. Bảng SHIFTS (Danh sách các ca làm việc Part-time & SOS)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Shifts]') AND type in (N'U'))
BEGIN
    CREATE TABLE Shifts (
        Id NVARCHAR(50) PRIMARY KEY,
        EmployerId NVARCHAR(50) FOREIGN KEY REFERENCES Users(Id),
        EmployerName NVARCHAR(150) NOT NULL,
        EmployerAvatar NVARCHAR(500) NULL,
        Title NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        WorkType NVARCHAR(30) DEFAULT 'PART_TIME', -- 'PART_TIME', 'GIG'
        ShiftDate NVARCHAR(50) NOT NULL,
        ShiftStart NVARCHAR(10) NOT NULL,          -- '18:00'
        ShiftEnd NVARCHAR(10) NOT NULL,            -- '22:00'
        DurationHours FLOAT NOT NULL,              -- 4.0
        Period NVARCHAR(20) NOT NULL,              -- 'MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'
        HourlyWage INT NOT NULL,                   -- 32000
        TotalBudget INT NOT NULL,                  -- 128000
        RequiredCandidates INT DEFAULT 1,
        FilledCandidates INT DEFAULT 0,
        IsSos BIT DEFAULT 0,                       -- 1 = Ca khẩn cấp thưởng tiền
        SosBonusAmount INT DEFAULT 0,
        RequiredSkills NVARCHAR(MAX) NULL,
        Latitude FLOAT NOT NULL,
        Longitude FLOAT NOT NULL,
        LocationAddress NVARCHAR(255) NOT NULL,
        Status NVARCHAR(30) DEFAULT 'OPEN',        -- 'OPEN', 'FILLED', 'COMPLETED'
        CreatedAt DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- 6. Bảng ESCROW_TRANSACTIONS (Giao dịch ký quỹ tự động VietQR PayOS)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EscrowTransactions]') AND type in (N'U'))
BEGIN
    CREATE TABLE EscrowTransactions (
        Id NVARCHAR(50) PRIMARY KEY,
        ShiftId NVARCHAR(50) FOREIGN KEY REFERENCES Shifts(Id),
        EmployerId NVARCHAR(50) FOREIGN KEY REFERENCES Users(Id),
        CandidateId NVARCHAR(50) NULL,
        Amount INT NOT NULL,
        PayosOrderCode NVARCHAR(50) NULL,          -- Mã đối soát đơn VietQR PayOS
        Status NVARCHAR(30) DEFAULT 'HELD',        -- 'HELD', 'RELEASED', 'REFUNDED'
        CreatedAt DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- 7. Nạp dữ liệu mẫu ban đầu (Initial Seed)
INSERT INTO Users (Id, Email, Phone, FullName, Role, AvatarUrl, KycIdNumber, IsKycVerified)
VALUES 
('user_cand_huy_01', 'huy.tnut@gmail.com', '0987654321', N'Nguyễn Đức Huy', 'CANDIDATE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '019283746512', 1),
('user_emp_lan_02', 'lan.thecuppa@gmail.com', '0912345678', N'Hoàng Thị Lan', 'EMPLOYER', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', '020192837465', 1);

INSERT INTO CandidateProfiles (UserId, Bio, University, TrustBattery, HourlyRateMin, Skills, Latitude, Longitude, LocationAddress)
VALUES 
('user_cand_huy_01', N'Sinh viên năm 3 ĐH Kỹ thuật Công nghiệp (TNUT)', N'ĐH Kỹ thuật Công nghiệp (TNUT) - Thái Nguyên', 100, 25000, N'["Phục vụ bàn", "Pha chế cơ bản", "Thu ngân POS"]', 21.5855, 105.8272, N'Ký túc xá K1, ĐH Kỹ thuật Công nghiệp, TP. Thái Nguyên');

INSERT INTO EmployerProfiles (UserId, CompanyName, BusinessType, Address, Latitude, Longitude, VerifiedBadge)
VALUES 
('user_emp_lan_02', N'The Cuppa Coffee & Tea', 'FNB', N'Số 142 Đường Hoàng Văn Thụ, TP. Thái Nguyên', 21.593, 105.834, 1);

PRINT N'Cơ sở dữ liệu SellTimeDB đã được khởi tạo thành công trên LAPTOP-FLO3DB3M!';
GO
