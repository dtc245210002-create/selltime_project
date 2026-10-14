---
id: SPEC-signup-collision
date: '2026-10-13'
status: awaiting-spec-review
companions: [migration-and-rollback.md, tests-and-normalization.md]
sources: []
---

# Signup collision giữa DEMO và tài khoản Auth thật

## Why

Email duy nhất toàn bảng public.users khiến signup thật thất bại khi email đã thuộc hồ sơ DEMO. Cho phép hai danh tính cùng email giúp đăng ký hoạt động mà không chuyển role, KYC hoặc ownership từ DEMO sang tài khoản thật.

## Capabilities

- **CAP-1**
  - **intent:** Người dùng đăng ký bằng email đã xuất hiện trong DEMO và nhận danh tính Auth riêng.
  - **success:** Với email trùng chính xác hoặc khác hoa/thường của DEMO, signup hợp lệ tạo profile có id/Auth UUID mới, role Candidate và KYC false; toàn bộ DEMO và quan hệ dữ liệu không đổi.
- **CAP-2**
  - **intent:** Các tài khoản Auth-linked không chia sẻ cùng email khi so sánh không phân biệt hoa/thường.
  - **success:** Duplicate thật bị chặn kể cả concurrent insert; không có profile dở dang, không merge theo email hoặc tiết lộ account tồn tại qua lỗi ứng dụng. Input sai giữ hành vi fail-closed.
- **CAP-3**
  - **intent:** Thay quy tắc uniqueness an toàn trên schema đang có mà không sửa dữ liệu người dùng.
  - **success:** Preflight xác minh dependency, duplicate, normalization và trạng thái schema; migration hoặc hoàn tất nguyên tử hoặc giữ trạng thái trước chạy. Phát hiện bất thường thì dừng, không tự sửa dữ liệu.
- **CAP-4**
  - **intent:** Người vận hành biết khi nào có thể rollback và khi nào phải dừng để bảo toàn dữ liệu.
  - **success:** Rollback khi còn thỏa uniqueness cũ phục hồi schema; khi có collision hợp lệ mới, rollback bị chặn trước DDL, không xóa/đổi email/merge bất kỳ row nào.

## Constraints

- User đã đồng ý ba hướng thiết kế: DEMO/Auth cùng email nhưng không liên kết; lower(email) unique chỉ cho Auth-linked; migration mới sau 006, giữ nguyên 006/bootstrap.
- Binding và authorization vẫn dựa vào auth_user_id đã xác minh, không email; signup chỉ Candidate, không kế thừa dữ liệu DEMO.
- Giữ email NOT NULL/VARCHAR(120) và validation ứng dụng hiện có; không sửa dữ liệu hoặc collation để ép migration chạy.
- Chuẩn bị spec và review được phép; implementation và database execution cần phê duyệt riêng. Không có SQL executable hoặc mã ứng dụng được tạo trong lượt spec.
- Bảo toàn dirty work, staged deletions, HEAD/index và credential; không commit/stash/reset/clean/checkout/deploy. Database integration chỉ trên test project được duyệt, không production hoặc credential cũ.
- Hai companion là phần bắt buộc của contract: normalization, migration dependencies, fixtures, rollback và acceptance evidence.

## Non-goals

- Tự chạy migration/fixture/database preflight, bật Auth LIVE hoặc nghiệm thu toàn Iteration 6.
- Đổi migration 006/bootstrap, gộp tài khoản, backfill email, sửa quyền/KYC/ownership DEMO, cấp Employer profile, email-change lifecycle, OAuth/OTP, payment/Admin UI.
- Gộp email qua dấu chấm, +tag, Unicode normalization hoặc tự đổi giới hạn 120 ký tự.

## Success signal

Trên môi trường test được phê duyệt riêng, evidence chứng minh signup DEMO/Auth cùng email thành công với UUID/role/ownership tách biệt; duplicate Auth-linked bị chặn, migration abort nguyên tử và rollback có điều kiện đều đạt. Mock/static checks không thay thế SQL/provider integration.

## Assumptions

- Nguồn Supabase Auth hiện tại lower email sau validation; phiên bản chạy ở test project và parity Unicode/locale chưa xác minh. Tests-and-normalization quy định gate phải đạt trước integration/triển khai, không giả định Go/JS/PostgreSQL case folding đồng nhất.
