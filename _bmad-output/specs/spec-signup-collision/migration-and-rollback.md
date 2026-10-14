# Schema, migration và rollback dự kiến

Tài liệu thiết kế, không phải lệnh được phép chạy. Chỉ tạo file SQL/code sau scope implementation riêng; database execution vẫn có checkpoint riêng.

## Điểm phụ thuộc hiện tại

- src/database/schema_supabase.sql: users.email VARCHAR(120) NOT NULL UNIQUE; public.users.id là khóa cho các quan hệ khác. Không thay schema baseline này trong scope mới.
- src/database/migrations/006_auth_ownership.sql: thêm auth_user_id unique/FK; DEMO giữ NULL. Trigger signup INSERT user mới theo NEW.id/NEW.email, role Candidate/KYC false và Candidate profile. Không upsert/link theo email.
- src/infrastructure/auth/server.ts: profile lookup bằng auth_user_id, không email; giữ cách xác minh này.
- src/app/api/auth/[action]/route.ts: trim/regex/giới hạn 120 ký tự, role guard và lỗi generic đã có. Chỉ sửa tối thiểu nếu normalization thực tế đòi hỏi, sau phê duyệt implementation.
- src/database/tests/000_test_baseline.sql, 006_auth_ownership.sql, 006_verify_rollback.sql là artifacts cũ; giữ nguyên. Suite mới phải áp dụng baseline → 006 → 007, bổ sung fixtures/rollback verification riêng, không chạy seed DEMO thật.

## Migration 007 dự kiến

Tên dự kiến 007_auth_email_uniqueness.sql. Ý nghĩa: partial unique index trên lower(email) cho auth_user_id IS NOT NULL thay UNIQUE(email) toàn bảng; không cho phép tự sửa DEMO hoặc Auth rows. Giữ NOT NULL/VARCHAR(120), Auth binding unique/FK, role guard/RLS và quyền hiện có.

Trước DDL, kiểm tra catalog thực tế: phiên bản PostgreSQL/extension/collation, constraint/index email hiện tại (definition và tên), FK/dependencies tham chiếu email, functions/views và code dựa vào lookup email duy nhất. Repo search không chứng minh database không có dependency ngoài repo.

Kiểm tra dữ liệu chỉ trên môi trường đã cấp quyền: Auth-linked duplicates theo lower(email); email blank, whitespace/normalization bất thường; orphan/binding sai và shape schema. Report chỉ counts/loại lỗi, không liệt kê email cá nhân. Bất thường/dependency chưa xử lý thì abort, không DROP CASCADE/backfill/delete/rename.

Trong một transaction, dùng lock phù hợp để không có khoảng trống uniqueness với concurrent writes; xác minh lại dữ liệu và definitions dưới lock, tạo index mới rồi bỏ chính xác constraint cũ đã kiểm tra. Không CREATE INDEX CONCURRENTLY trong transaction. Lock timeout/DDL failure rollback toàn bộ. Nếu artifact/index đã có, chỉ chấp nhận definition tương đương; definition khác phải HALT. Không giả định mọi constraint tên users_email_key.

Nếu cần thay trigger để validate NEW.email, thực hiện trong 007 và giữ SECURITY DEFINER/search_path/grants cùng role/UUID/atomic profile creation của 006. Không tự chỉnh schema auth hoặc ghi email canonical của provider. Không lấy role/binding từ metadata. Không che unique violation bằng cách trả về DEMO row.

## Rollback

- Migration failed: transaction phục hồi DDL và constraint trước chạy; không để index/constraint dở dang.
- Sau áp dụng, trước collision: dưới lock, xác minh dữ liệu vẫn thỏa chính xác UNIQUE(email) cũ, rồi phục hồi constraint cũ trước khi bỏ index mới; khôi phục trigger definition nếu 007 đã đổi.
- Sau collision DEMO/Auth hợp lệ: uniqueness toàn bảng có thể không tái lập được. Rollback phải dừng trước bất kỳ DDL nào; giữ schema/dữ liệu mới và báo cần recovery/forward fix được duyệt riêng. Không xóa tài khoản, chuyển binding, đổi email hoặc reset test project tự động.
- Rollback fixtures bằng transaction rollback chỉ kiểm tra test isolation; không thay thế phép thử rollback schema có điều kiện nêu trên.

## Gates

Spec review → implementation scope → local/static evidence review → test project/credential/tool/DB command approval → SQL/provider integration → acceptance. Không bước nào tự cấp quyền cho bước sau. Auth LIVE giữ tắt; thu hồi credential cũ và các yêu cầu hardening khác vẫn là gate trước LIVE.
