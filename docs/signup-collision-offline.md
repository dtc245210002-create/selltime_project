# Chuẩn bị signup collision offline — Iteration 6

Migration 007 cho phép DEMO/Auth cùng email, giữ UUID/role/KYC/ownership tách biệt. Partial unique index `lower(email) WHERE auth_user_id IS NOT NULL` chỉ khóa duplicate thật. API/server giữ nguyên: lookup `auth_user_id`, Candidate-only, trim/regex/raw input 120 ký tự, generic error và session cookie. Các files 006/bootstrap/fixtures/canonical spec giữ nguyên.

Scope hiện tại chỉ tạo file và chạy local/static. **SQL/provider/concurrency/Unicode integration: NOT RUN**. Chưa nghiệm thu Iteration 6, chưa bật Auth LIVE. Không request database/provider/network, không credential, không SQL runner, deploy hoặc Git mutation.

## Run order dự kiến sau approval riêng

Test target đã được chỉ định: **Supabase test ref `dauglhucpflemfdsygzr`**, với approval preflight chỉ đọc đã có trong lịch sử task. **NOT APPROVED: thực thi migration 007, fixtures, SQL/provider integration hoặc cleanup DB**; các bước này vẫn cần approval riêng. Provider version/settings, credential mới và tool/lệnh cho các bước thực thi phải được xác minh trước khi chạy. Không dùng production, DEMO seed thật hay credential cũ; tài liệu này không tự cấp quyền. Scope offline hiện tại không kết nối hay sử dụng credential, không có lệnh auto-connect.

1. Local review các artifacts/evidence; chốt project/test tool/command/fixture scope riêng.
2. `src/database/tests/000_test_baseline.sql` (bootstrap không seed, từ chối bảng có sẵn) → `src/database/migrations/006_auth_ownership.sql`.
3. Diagnostic catalog/environment/provider parity bằng `007_environment_and_unicode.sql`; review dependency ngoài repo (functions/views/FKs/indexes, dynamic SQL/application lookup email), duplicate/normalization/binding/shape và phiên bản/collation. Unresolved dependency/mismatch phải HALT. Không log email thật.
4. `007_auth_email_uniqueness.sql` trong transaction riêng. Script đã có BEGIN/COMMIT; không bọc trong fixture transaction hoặc runner tự COMMIT. Dùng ON_ERROR_STOP; lỗi phải rollback và kiểm tra lại bằng session đặc quyền mới.
5. Chạy suite cũ 006, rồi `007_signup_collision.sql` (fixture transaction rollback + residue check). Chạy mọi biến thể trong `007_runtime_scenarios.md` trên target riêng theo approval, gồm concurrency/DDL timeout/failure/preflight/definition/schema rollback.
6. Provider signup/login/concurrency thật và parity Unicode đúng phiên bản/settings; so identity/rows/access/canonical UTF-8 thay vì chỉ error response. Fixture đã COMMIT/provider-created có cleanup approval riêng, không tự DELETE/reset project. Sau lỗi kiểm tra residue bằng `007_verify_residue.sql` trong phiên đặc quyền mới; không để RLS che residue.
7. Review integration evidence, acceptance riêng. Auth LIVE vẫn cần gates/hardening/credential mới khác.

## Guards và rollback

007 lock Auth trước users, thời hạn lock 5s và statement 60s; shape/binding/dữ liệu/dependency/definition recheck dưới lock trước DDL. Index mới tạo trước bỏ đúng constraint cũ lấy từ catalog, không hardcode tên, không CONCURRENTLY/CASCADE. Constraint chỉ chấp nhận nondeferrable UNIQUE(email); index có sẵn chỉ chấp nhận đúng definition. Extra unique email index/dependency/collation mismatch dừng, không repair. Rerun chỉ chấp nhận metadata/function/index đồng nhất. Record version/extension count/email collation không chứa dữ liệu người dùng.

Guard signup mới chỉ reject email null/blank/internal whitespace/sai format/over 120, không trim/lower/NFKC hay sửa email provider; defaults UUID/Candidate/KYC false/profile nguyên văn 006. CREATE OR REPLACE giữ owner/ACL và SECURITY DEFINER/search_path/grants; không thay trigger binding/RLS. Index comment ghi tên constraint thực tế và function bodies cố định để rollback; mất/đổi comment là HALT. MD5 trong rollback chỉ kiểm tra tính khớp artifact, không chứng minh chống DBA sửa dữ liệu. Local static đối chiếu body snapshot nguyên văn 006 và fingerprint rollback.

Rollback schema `007_rollback.sql` là thao tác riêng, khác ROLLBACK fixture. Dưới lock, duplicate theo **email nguyên bản/collation cũ**, metadata/function/index/name/dependency conflict phải được kiểm tra trước DDL. Exact collision hợp lệ mới → SQLSTATE 23505, giữ schema/rows mới, cần recovery/forward fix riêng. Mixed-case khác byte có thể vẫn thỏa UNIQUE(email) cũ. Khi hợp lệ, khôi phục constraint cũ trước bỏ partial index, khôi phục body 006, không xóa/đổi email/merge/binding bất kỳ row nào.

Go/JS/PostgreSQL case folding và JS UTF-16 length/PostgreSQL char length chưa có parity. Các fixture I/İ/ı, ký tự ghép và whitespace Unicode chỉ có local input checks/read-only diagnostic/hướng dẫn provider. Không khẳng định email khác byte cùng identity, không tự đổi policy/collation/ASCII restrictions. Unknown dynamic SQL/dependency ngoài catalog/repo cần người vận hành audit; catalog checks không chứng minh mọi consumer đã được liệt kê.

## Evidence theo matrix

| Nhóm | Evidence offline | Runtime còn lại |
|---|---|---|
| CAP-1 exact/case collision, DEMO Employer/KYC/quan hệ | Route thật + provider stub kiểm binding UUID; SQL fixture/snapshot EXCEPT ALL, RLS/default assertions | SQL trigger/RLS/rows/ownership: NOT RUN |
| CAP-2 role/spoof/null/blank/whitespace/120/trim/login | `signup-collision.test.mjs` kiểm input/provider args/generic response/cookie; suite 006 giữ nguyên | Direct provider metadata/SQL atomicity: NOT RUN |
| CAP-2 duplicate Auth và concurrent signup | SQLSTATE 23505 + no orphan assertions, hai-session/provider kế hoạch | Uniqueness/concurrency: NOT RUN |
| CAP-2 Unicode/collation | Local input preserving code points; environment/UTF-8 diagnostic | Provider/PostgreSQL parity: NOT RUN |
| CAP-3 duplicate/dependency/shape/definition/timeout/failure | Guard/order static + từng kịch bản negative ở `007_runtime_scenarios.md` | Abort atomic/catalog/lock thực: NOT RUN |
| CAP-4 rollback trước/sau collision | Conditional rollback artifact, fingerprint/order static, schema/row snapshot kế hoạch | Schema rollback thực: NOT RUN |
| Role/ownership/DEMO regressions | Suite 006/API security local được giao orchestration verification | Provider/SQL regression: NOT RUN |

Kiểm tra local dùng Node/TypeScript đã có, không cài dependency:

```text
node src/__tests__/signup-collision.test.mjs
node scripts/verify-signup-preparation.cjs
node src/__tests__/auth-ownership.test.mjs
node src/__tests__/request-body.test.mjs
node src/__tests__/selltime-core.test.mjs
node --test src/__tests__/build-realpath.test.cjs
node node_modules/typescript/bin/tsc --noEmit --incremental false
npm run build
```

Evidence mới ở `_bmad-output/implementation-artifacts/verification-6-signup-offline/`; `local-signup.log`/`static-signup.log` chỉ local/static. File `preserved-before.json` và evidence hậu kiểm bảo toàn hashes 006/bootstrap/fixture/API/server/tests cũ, HEAD/index/staged deletion. Full regression/tsc/build được orchestration ghi riêng trong cùng directory sau handoff. Không gọi static PASS là SQL/provider acceptance; STOP trước database.
