# Kịch bản SQL/provider chưa được chạy

Trạng thái mọi mục dưới đây: **NOT RUN**. Chỉ thực thi trên project Supabase test thật, disposable được duyệt riêng, với từng script/lệnh/fixture/cleanup được duyệt. Không seed thật, không reset/drop project. Session SQL đặc quyền phải `row_security=off` để lỗi quyền không che dữ liệu; session RLS là `authenticated` không SUPERUSER/BYPASSRLS. Chạy psql với ON_ERROR_STOP; khi lỗi, ROLLBACK trong session và kiểm tra từ session đặc quyền mới.

## CAP-3: preflight/atomicity/definition

Mỗi biến thể dùng một test target disposable độc lập, baseline → 006. Ghi snapshot catalog (constraint/index/function owner/ACL/trigger/RLS/policies/grants), tổng rows và JSON fixture trước/sau. Không log email/secret thật. Không dùng schema production hoặc baseline có seed.

1. Duplicate trước 007: tạo hai Auth fixture `auth007-preflight@test.invalid` và `AUTH007-PREFLIGHT@TEST.INVALID` bằng UUID 711/712 trong namespace `00000000-0000-4000-8000-0000000007xx`. Xác nhận lower(email) duplicate count=1, mỗi Auth có profile. Chạy 007 riêng: SQLSTATE P0001, transaction abort; constraint cũ/trigger/rows không đổi và index mới không tồn tại. Không tự sửa duplicate. Nếu provider có guard chặn setup thì ghi đó là provider outcome; direct SQL chỉ trên target/lệnh được duyệt.
2. Unknown dependency: trong fixture transaction riêng được duyệt, tạo view `public.auth007_email_dependency` đọc users.email; riêng biến thể FK tới users.email và function lookup email. Chạy 007 riêng: P0001 trước DDL, view/FK/function và constraint cũ giữ nguyên. Repo search không chứng minh catalog bên ngoài sạch.
3. Shape/normalization/binding: biến thể email type/NOT NULL sai, email blank/internal ASCII hoặc Unicode whitespace, public/Auth email mismatch, thiếu FK/UNIQUE binding, profile missing. Mỗi biến thể phải P0001, không repair/backfill. Setup bất thường chỉ theo lệnh test riêng, không tự drop guard để chạy.
4. Index khác definition: trước 007 tạo tên `users_auth_email_lower_uidx` với nonunique, predicate khác, trim(email), collation/opclass khác hoặc INCLUDE. Mỗi biến thể P0001, index cũ giữ nguyên. Constraint DEFERRABLE/multi-constraint cũng phải HALT. Biến thể rename constraint cũ: 007 và rollback dùng đúng tên đã rename, không hardcode.
5. Rerun: sau 007 thành công, chạy lại 007 trên schema đúng; catalog/rows/ACL không đổi. Sửa index comment/function/predicate trong fixture riêng phải HALT, không recreate. Nếu schema/index thiếu cả rule cũ và mới phải HALT.
6. DDL failure: role test đã duyệt có quyền đọc/lock nhưng thiếu quyền CREATE INDEX hoặc ALTER; chụp snapshot rồi chạy 007. Mong đợi insufficient_privilege 42501 và rollback transaction, rule cũ vẫn tồn tại, không index/trigger dở dang. Một biến thể failure sau CREATE INDEX phải được operator chuẩn bị theo lệnh riêng để xác minh toàn bộ DDL rollback.

## CAP-2: hai session concurrent INSERT

Chạy sau 007, namespace fixture sạch. Đây là test SQL direct insert, chưa chứng minh provider.

Session A: BEGIN; INSERT `auth.users(id,email,raw_user_meta_data)` UUID 721, email `auth007-concurrent@test.invalid`, metadata `{}`. Giữ transaction mở (không dùng sleep tự động). Session B: BEGIN; `SET LOCAL lock_timeout='5s'`; INSERT UUID 722, email `AUTH007-CONCURRENT@TEST.INVALID`. Xác nhận B bị chặn khi A chưa kết thúc. Để kiểm tra unique_violation thật, operator duyệt fixture A COMMIT và tiếp tục B; B phải SQLSTATE 23505 (hoặc provider constraint 23505), ROLLBACK B; privileged verifier đếm Auth/users/profiles cho 721 bằng 1, 722 bằng 0, lower(email) count bằng 1. Nếu B hết lock_timeout trước A commit: 55P03 chỉ là timeout outcome, chưa PASS uniqueness concurrent.

Biến thể A ROLLBACK: B tiếp tục thành công; ROLLBACK B để isolation. Nếu A đã COMMIT, cleanup residue của 721 cần lệnh riêng được duyệt; không tự DELETE. Chạy residue verifier sau cleanup. Provider concurrency: hai signup thực đồng thời qua API cho cùng canonical email, xác nhận tối đa một identity thật mới/profile mới; duplicate response generic/confirmation theo settings provider, không buộc provider tiết lộ account tồn tại. Ghi ids/counts, bỏ token/password/email cá nhân.

## CAP-3: writes khi migration/timeout

Target độc lập sau 006. A BEGIN, lock `auth.users` SHARE ROW EXCLUSIVE rồi `public.users` ACCESS EXCLUSIVE. B chạy nguyên script 007; giữ A đến B nhận 55P03 lock timeout, kiểm tra B transaction abort và catalog giữ nguyên. ROLLBACK A. Biến thể A giữ INSERT Auth chưa commit, B chạy 007: xác nhận B không vượt lock; kết thúc A theo approval, B recheck dữ liệu mới rồi thành công hoặc HALT nếu duplicate. Không có khoảng trống uniqueness: rule cũ tồn tại đến partial index đã valid. Thu evidence từ catalog/session timing, không suy ra concurrency PASS từ static marker.

## CAP-4: rollback schema thật

Trước collision: target độc lập sạch sau 007; chụp full rows + catalog/trigger/ACL/grants. Chạy `007_rollback.sql` riêng. Xác nhận đúng constraint name lưu trong index comment được phục hồi UNIQUE(email), index mới không còn, prosrc/owner/ACL của trigger bằng 006 và toàn bộ rows unchanged. Sau đó áp dụng lại 007 nếu cần test khác, theo approval. Không nhầm với ROLLBACK fixture.

Sau collision: target độc lập sau 007 với DEMO/Auth exact email fixture đã COMMIT theo approval (UUID 731). Chụp rows/candidate profiles/quan hệ và index/trigger/constraint trước. Chạy nguyên `007_rollback.sql` riêng: SQLSTATE 23505 từ guard, transaction abort trước DDL; trong session mới, xác nhận collision rows/quan hệ/metadata/index/trigger không đổi và rule cũ chưa tái tạo. Không tự xóa/rename/merge tài khoản. Recovery/cleanup/forward fix cần scope riêng. Mixed-case DEMO/Auth khác byte có thể vẫn thỏa UNIQUE(email) cũ; rollback cho phép đúng semantics constraint cũ, không coi lower duplicate toàn bảng là điều kiện rollback.

## Unicode/provider gate

Chạy diagnostic `007_environment_and_unicode.sql` với collation email thực; ghi PostgreSQL, extension, collation version, Supabase Auth build/version, Go version nếu có, confirmation settings. So từng fixture ASCII mixed case, I/İ/ı, é/e+combining accent, NBSP/ideographic whitespace giữa API input sau trim, provider canonical output và PostgreSQL lower UTF-8. Không chỉ nhìn hình dạng chữ. API hiện không lower hay NFKC, trigger không rewrite. Unicode có khác byte không mặc định cùng identity. Bất kỳ mismatch/không biết phiên bản: HALT integration/triển khai, chốt policy riêng; không ép ASCII/collation hoặc backfill. Giới hạn JS UTF-16 length 120 và PostgreSQL char length cũng cần provider parity gate với ký tự ngoài BMP.
