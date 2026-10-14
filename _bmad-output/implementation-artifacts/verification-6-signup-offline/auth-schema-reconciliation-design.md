[C2C]
STATE: AUTH_SCHEMA_RECONCILIATION_DESIGN
TASK_ID: c2c_a73f
ITERATION: 6
WORKSPACE: selltime_project / e9c367fdc841
STATUS: OFFLINE DESIGN ONLY — NOT IMPLEMENTED

## Kết luận và evidence

Không chạy trực tiếp 006/007 trên schema test hiện tại. Diagnostic SQL đã hoàn tất READ ONLY → COMMIT, exact psql exit 0. Tuy nhiên database không khớp baseline mà 007 yêu cầu. Chỉ tạo tài liệu này; không sửa migration, API, SQL diagnostic hoặc database.

Nguồn: diagnostic-result-20261014.md, diagnostic-live-20261013T172016357.log/json/exit.txt; src/database/migrations/006_auth_ownership.sql và 007_auth_email_uniqueness.sql; src/database/schema_supabase.sql; src/infrastructure/auth/server.ts; src/app/api/auth/[action]/route.ts. Local search trong src/scripts/docs/specs không tìm thấy định nghĩa st_auth_new_identity hoặc st_auth_identity_created. Điều này không chứng minh nguồn không tồn tại ở nơi khác; không inspect workspace khác.

Observed: st_auth_identity_created → public.st_auth_new_identity(), enabled AFTER INSERT ROW, SECURITY DEFINER, owner postgres, empty search_path. Function body chỉ có hash 5f763cd39b9b47c3219d37daaef72c96, không được đọc. Các function 006 handle_auth_signup/current_app_user_id/current_app_role/set_employer_role không tồn tại dưới đúng tên trong public. Role/ACL đã đọc chỉ là subset, không chứng minh tương đương authorization.

Local 006: signup tạo public.users id=Auth UUID dạng text, binding auth_user_id, Candidate/KYC=false và candidate_profiles mới trong cùng transaction; không merge DEMO theo email. API verifyToken tra hồ sơ bằng auth_user_id đã được provider xác minh. API employer gọi set_employer_role; helper và policy 006 dựa trên current_app_user_id/current_app_role. Vì vậy chỉ rename trigger không giải quyết RPC/RLS compatibility.

## B1 — Các phương án signup/schema

| Phương án | Lợi ích | Rủi ro / điều kiện trước implementation |
|---|---|---|
| A: Đưa schema hiện hữu về contract 006 bằng migration reconciliation mới | API/RLS/test suite có một contract thống nhất | Cần nguồn đáng tin của trigger/function hiện hữu, inventory grants/policies/dependencies đầy đủ, dữ liệu preflight được duyệt, retention policy và rollback. Không blind replay 006; policy-drop loop 006 có thể ghi đè policy hiện hữu. |
| B: Giữ contract st_auth_* và adapt application/test/migration | Có thể giữ semantics hiện tại, giảm thay đổi database | Chưa biết function body, default role/KYC/ownership/email collision; cần làm rõ RPC/role-management và policy equivalents. Scope API/schema lớn hơn 007; phải xin spec/implementation riêng. |
| C: Dùng môi trường integration mới được human xác nhận disposable, dựng baseline chuẩn | Có thể chứng minh contract repo riêng mà không sửa schema đang quan sát | Cần checkpoint riêng để tạo/dựng môi trường; không reset hoặc xóa project hiện tại. PASS trên môi trường mới không chứng minh project hiện hữu đã được hòa giải. |

Đề xuất an toàn lúc này: chưa chọn A/B bằng suy đoán; trước hết xin nguồn migration/function st_auth_* đã sanitize hoặc một scope đọc định nghĩa riêng, kèm fingerprint khớp evidence. Hash/owner/search_path không chứng minh Candidate default, validation hay ownership. Nếu human ưu tiên chứng minh code repo trước và có project disposable được duyệt, C là đường thử độc lập; không tự tạo database.

Contract bắt buộc dù chọn A/B: đúng một signup handler có tác dụng tạo profile; role Candidate mặc định và KYC=false; không tin role/client owner/metadata nâng quyền; không merge/rebind theo email; Auth/DEMO trùng email nhưng identity và ownership tách biệt; lỗi tạo profile rollback cùng Auth insert. Không tạo trigger thứ hai khi chưa chứng minh handler cũ đã bị vô hiệu hóa/thay thế atomically trong migration được duyệt. Không backfill hồ sơ có sẵn chỉ dựa trên email.

Rollback thiết kế: snapshot definition/fingerprint/owner/ACL/trigger enable state dưới lock, xác nhận contract trước DDL; restore exact prior objects only when fingerprints still match. Không DROP CASCADE. Nếu rollback unique email bị collision hợp lệ chặn, HALT; không xóa/merge user để ép rollback. Snapshot body có thể chứa thông tin ngoài scope, cần quyền thu thập riêng; không thể thực hiện từ evidence hash hiện tại.

## B2 — Thiết kế guard collation (đề xuất, chưa code)

Observed database provider ICU i: recorded datcollversion=153.121, actual_database_version=153.121. Email collation provider d: database default, deterministic=true, own collversion=NULL. Không có bằng chứng database-level mismatch. Current 007 áp dụng own collversion IS DISTINCT FROM actual cho mọi provider nên sẽ HALT trên metadata này.

Đề xuất phân nhánh theo provider và fail closed:
1. Xác định đúng attcollation của email, encoding/type/deterministic, phiên bản PostgreSQL được hỗ trợ.
2. Nếu provider d: dùng recorded pg_database.datcollversion và pg_database_collation_actual_version của current_database, cùng datlocprovider. Không dùng NULL own collversion để kết luận drift. Giữ kiểm tra email collation deterministic và xác minh actual default/database consistent.
3. Nếu explicit ICU/libc: so sánh recorded/actual của đúng collation object. Thiếu metadata, provider không được hỗ trợ hoặc recorded/actual khác nhau: HALT. Không coi mọi NULL là PASS; chỉ cho phép trạng thái no-version khi có rule riêng cho provider/version được chứng minh.
4. Unknown provider, nondeterministic hoặc genuine version drift: HALT, không refresh/reindex/đổi collation tự động. Builtin/no-version providers cần spec/test riêng trước hỗ trợ.
5. Không thay canonical email/lower/trim policy. Unicode lower semantics và Supabase provider parity vẫn là integration gate, không được suy luận từ version match.

Đây là đề xuất sửa logic offline có review/test; chưa sửa 007 và chưa cấp quyền chạy. PostgreSQL định nghĩa d là database default và lưu version riêng ở pg_database:
- https://www.postgresql.org/docs/17/catalog-pg-collation.html
- https://www.postgresql.org/docs/17/catalog-pg-database.html

## B3 — Quyết định deletion/retention cần human

Observed FK auth_user_id → auth.users(id): validated/nondeferrable, ON DELETE SET NULL. Local 006/007 yêu cầu CASCADE. Hai lựa chọn có tác động khác nhau; không phải sửa tên constraint.

| Chính sách | Identity / dữ liệu | Rủi ro và việc phải thiết kế |
|---|---|---|
| Giữ SET NULL | Xóa Auth vẫn giữ public.users/profile và các FK ownership dựa public.users.id; binding bị mất | Dữ liệu/email/KYC còn lưu. auth_user_id NULL hiện cũng là dấu DEMO trong thiết kế, nên tài khoản đã xóa không được tự chuyển thành DEMO hoặc được rebind theo email. Cần trạng thái provenance/deactivation, retention/anonymization và access denial riêng; chưa có contract này. Global/partial email uniqueness sau unbind phải được review. |
| Chuyển CASCADE | Xóa Auth cố xóa public.users; profile/shifts/applications có cascade trong baseline local | Có thể xóa chuỗi ownership, còn escrow SET NULL hoặc bị NO ACTION của messages/conversations chặn. Không được hứa xóa hết hoặc thành công: dependent FK thực tế chưa inventory đầy đủ. Tác động audit/lịch sử và người đối thoại phải được duyệt; dữ liệu đã xóa không rollback bằng DDL. |
| Thiết kế lifecycle deactivation trước hard-delete | Có thể tách thu hồi access khỏi retention | Feature/schema/lifecycle mới nằm ngoài Iteration 6 hiện tại; phải xin scope riêng. Không tự implement soft delete. |

Chưa có recommendation đổi FK chỉ để làm 007 pass. Human phải chốt mục đích retention, dữ liệu nào cần giữ/anonymize/xóa, hard-delete có được hỗ trợ không, và xử lý ownership/lịch sử đối tác. Không đưa ra thời hạn pháp lý hoặc retention cụ thể khi chưa có yêu cầu. Trong khi chưa chốt: không hard-delete Auth, không đổi FK và không nghiệm thu LIVE. Session/token đã cấp trước khi xóa cần test provider validation/RLS denial, không giả định FK đủ thu hồi access.

## Test plan và gates (tất cả NOT RUN trong scope này)

| Gate | Case / tiêu chí |
|---|---|
| Offline collation tests | d+database versions match cho phép; real mismatch/unknown/nondeterministic thiếu metadata HALT; explicit provider recorded/actual check đúng; metadata NULL không blanket-pass. PostgreSQL runtime tests phải riêng, mocks không proof. |
| Schema contract | Expected handler/helpers/RPC signatures/owner/ACL/policies được đối chiếu với actual trusted definitions; wrong fingerprint/dependency HALT trước mutation. Exactly one effective signup handler. |
| Signup integration | Exact/case DEMO/Auth collisions; new independent profile; Candidate/KYC=false; malicious metadata role denied; failure rollback no orphan; concurrent same-email registrations chỉ một Auth identity; provider-confirm-email paths. |
| RLS/API | A/B isolation, wrong employer owner, directSQL role/binding/KYC writes denied, Admin-only Employer grant, revoked role effects; legacy st_auth_* policy không permissive OR leak. |
| Deletion policy | Fixture graph có profile, shifts/applications, messages/conversations/escrow; test approved retention or cascade semantics, failed-delete atomicity, no orphan/identity takeover, detached user never becomes DEMO. Not permitted until human policy and fixture execution checkpoints. |
| Rollback | Restore definitions/ACL/fingerprints; drift HALT; email collision rollback HALT without deleting data. DDL rollback cannot restore deleted rows. |
| Preservation | HEAD/index/dirty work/staged deletions unchanged; SQL changed only after implementation approval, database operations separately authorized. |

Phê duyệt cần tách: (1) hướng A/B/C và deletion policy; (2) scope thu thập nguồn/metadata bổ sung nếu cần; (3) spec/implementation offline; (4) database test execution/migration/fixtures. Không bước nào tự cấp quyền bước sau. Integration không dùng credential cũ; Auth LIVE vẫn tắt.

## Current preservation / remaining uncertainty

HEAD=96f4be8575718d50eab2285ab5241d1583f3423a; index SHA256=2CCEC39D9D69A39044F41840197966E9D329EC3DEF5935BF7372CE342253888A. Migration 006/007, schema, source ứng dụng giữ nguyên. Không DB query, fixture, secret access, Git mutation hoặc deploy trong thiết kế này.
Unknown: source/body semantics st_auth_new_identity; actual full policies/ACL/helper contracts/dependency FK graph; provenance/retention expectations; dữ liệu hiện hữu và provider parity. Không dựa tên st_auth_* để suy luận tương đương.
NEXT_EXPECTED_STEP: STOP — ChatGPT review artifacts và human policy decisions.

ChatGPT review received: DESIGN_ACCEPTED_POLICY_PENDING; DESIGN_VERDICT ACCEPTED; IMPLEMENTATION NOT APPROVED; DATABASE_EXECUTION NOT APPROVED. Suggested A as reconciliation direction only after existing handler evidence; deletion/retention requires human choice, including option to leave it undecided and forbid hard-delete. Preselected UI choices are not human approval. Next: receive decisions, then prepare narrow offline spec/evidence acquisition plan. Codex stopped without implementation or additional DB access.
