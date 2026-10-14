# Normalization và acceptance tests

## Bằng chứng và phạm vi normalization

Nguồn chính thức đọc ngày 2026-10-13: [Supabase Auth validateEmail](https://github.com/supabase/auth/blob/master/internal/api/mail.go) kiểm tra email rỗng, độ dài/format rồi dùng strings.ToLower; [signup](https://github.com/supabase/auth/blob/master/internal/api/signup.go) gọi validation trước tạo user. Đây là nguồn master hiện tại, không chứng minh phiên bản project test đang chạy.

SellTime đã trim email bằng boundedString, kiểm tra length input tối đa 120 và regex không whitespace nội bộ. Giữ hành vi này cho signup/login; không mở rộng giới hạn theo mức 255 byte của provider. Trigger nhận NEW.email do provider tạo, không trust email hay role do client dùng để claim ownership. Giữ NOT NULL và reject blank/invalid thay vì sửa dữ liệu hiện có.

Case-insensitive uniqueness dùng lower(email) đúng quyết định user. Không tự thêm trim vào index để thay đổi quyết định đã duyệt, cũng không tự bỏ dấu chấm/+tag hay NFKC/punycode. Nếu có Auth-linked email chứa whitespace không canonical, preflight dừng để review; không backfill.

Unicode/collation: Go strings.ToLower, JS trim/toLowerCase và PostgreSQL lower có thể khác theo ký tự/locale. Test parity với ASCII mixed case, I/İ/ı, ký tự ghép và khoảng trắng Unicode trên provider/collation được phép; ghi phiên bản và collation. Không khẳng định các email Unicode khác byte là cùng danh tính nếu chưa có bằng chứng. Nếu parity không đạt, HALT để chốt policy; không tự đổi collation hoặc hạn chế ASCII.

## Ma trận tests dự kiến

Fixtures mới là giả lập/disposable, có prefix riêng; giữ fixtures 006 và DEMO thực. DEMO fixture có auth_user_id NULL, role Employer, KYC true, ca/hội thoại liên quan; snapshot row/relations trước test. Auth mới dùng UUID khác và cùng email để chứng minh không kế thừa.

| Case | Evidence cần đạt |
|---|---|
| DEMO/Auth cùng email chính xác hoặc khác case | Auth UUID mới/Candidate/KYC false/profile mới; DEMO và mọi quan hệ không đổi |
| Hai Auth-linked cùng email hoặc chỉ khác case | SQL unique guard chặn; không có user/profile mồ côi |
| Hai signup concurrent | Không tạo hai identity thật cùng canonical email; không merge; lỗi API không enumeration |
| DEMO Employer/KYC/shift/conversation cùng email | Auth mới không có role/KYC/ownership/read access của DEMO |
| Metadata Admin/Employer/binding spoof | Direct provider signup không đổi defaults trigger; API role guard 403 vẫn giữ |
| Email null/empty/whitespace nội bộ/over 120 | Fail-closed đúng boundary hiện có; không row dở dang |
| Trim/mixed case/login và parity Unicode | Theo normalization hiện có/provider; mismatch phải báo gate chưa đạt |
| Duplicate Auth-linked/unknown dependency trước migration | Abort không sửa dữ liệu, constraint cũ còn nguyên |
| Concurrent writes lúc migration hoặc DDL timeout/failure | Không khoảng trống uniqueness; transaction abort nguyên tử |
| Index/constraint definition khác dự kiến | HALT, không drop/recreate tự động |
| Rollback trước collision | Constraint/trigger cũ phục hồi, rows unchanged |
| Rollback sau collision hợp lệ | Abort trước DDL, không xóa/rename/merge rows |
| Role/ownership/DEMO regressions | Suite 006 và API security không suy giảm |

## Các lớp evidence

- Local: unit API boundary/normalization/role tests, static migration checks, security/regression, TypeScript và build; không provider/database thật.
- SQL integration: trên test project được duyệt, tạo schema/fixtures chỉ bằng lệnh duyệt riêng, thực thi constraint/trigger/RLS/rollback checks; assert SQLSTATE/rows chứ không chỉ tìm marker text.
- Provider integration: Supabase Auth signup/login thật bằng fixture test, không email cá nhân/credential cũ; record settings/confirmation flow, không giả định duplicate signup luôn trả lỗi vì provider có thể che thông tin account tồn tại. Acceptance đánh giá identity/rows/access, không buộc đổi policy chống enumeration.
- Cleanup: fixture rollback hoặc cleanup đã duyệt; kiểm tra residue trong auth.users/public.users/profiles/relationships. Không tự DROP/RESET project. Logs chỉ ids test/counts/status đã loại secret, không password/token/email thật.

Lượt spec này không chạy bất kỳ test SQL/provider, build hoặc migration nào. Acceptance Iteration 6 và Auth LIVE vẫn chưa cấp.
