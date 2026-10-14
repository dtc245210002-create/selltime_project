[C2C]
STATE: AUTH_RECONCILIATION_SPEC_READY
TASK_ID: c2c_a73f
ITERATION: 6
WORKSPACE: selltime_project / e9c367fdc841
STATUS: OFFLINE SPECIFICATION — IMPLEMENTATION/DB EXECUTION NOT APPROVED

## 1. Contract-vs-observed matrix

Human decision: approach A, target Auth/role/ownership contract 006; deletion UNDECIDED, preserve current SET NULL, no Auth hard-delete. Historical 006/007 remain unchanged. Target is not literal replay of 006: its CASCADE clause conflicts with this explicit exception.

| Contract mục tiêu | Observed qua diagnostic | Requirement / gate |
|---|---|---|
| Một signup handler; profile mới Candidate/KYC=false, identity id độc lập DEMO | st_auth_identity_created → st_auth_new_identity(), hash 5f763cd39b9b47c3219d37daaef72c96; body chưa đọc | Acquire approved trusted definition, đối chiếu semantics; không rename/replace/add trigger dựa tên/hash |
| handle_auth_signup, current_app_user_id/current_app_role, set_employer_role theo 006 | Không tồn tại dưới các tên đã query | Reconciliation cần helper/RPC signatures, ACL và policy inventory đầy đủ; không suy luận helper tương đương |
| Server getUser(token), profile.eq(auth_user_id, verified Auth UUID) | Code server dùng contract này; DB behaviors chưa integration test | Preserve server validation, stable public.users.id và ownership; không owner/role từ client |
| Candidate mặc định, Admin-only Employer grant; không tự đăng ký Admin | Existing function SECURITY DEFINER/empty search_path/owner postgres, chưa biết body/defaults | Reject metadata role escalation; restrict EXECUTE và column writes; chức năng/privilege runtime cần tests |
| RLS scope users/profile/shifts/messages theo role/owner/member | Ten relations RLS enabled; sampled protected writes denied; st_auth_users_own SELECT policy | Enabled/hash/subset ACL không proof equivalent policy; inspect effective grants và policy expression theo approval riêng |
| Auth UUID nullable unique binding → auth.users(id) | Validated nondeferrable FK, SET NULL; binding unique | Preserve FK deletion semantics. Không yêu cầu CASCADE khi retention chưa chốt |
| Auth-linked lower(email) unique; DEMO/Auth email collision allowed; email varchar120 NOT NULL | Global users_email_key còn tồn tại; 007 chưa áp dụng | Index/constraint change chỉ sau separate reviewed implementation + data preflight counts approval |
| Provider-aware collation consistency | Database ICU recorded/actual153.121 match; default provider d own versionNULL | Default guard dùng database metadata; 007 own-version comparison chưa compatible |
| Migration 007 baseline trigger/body/FK guards | 007 expects missing function/trigger and CASCADE | Không chạy 007 nguyên trạng; future compatibility spec phải preserve SET NULL và fail-closed contract |

Nguồn giữ load-bearing: local 006/007/schema/API/Auth; design/report/log diagnostic hiện có. Diagnostic exact psql0 và COMMIT chứng minh catalog queries hoàn tất, không chứng minh signup/RLS integration.

## 2. Signup unknowns

Unknowns bắt buộc: existing handler body/source version/dependencies; defaults/profile creation/error handling; duplicate/email lookup/rebind behavior; role/KYC metadata trust; other trigger/write paths; full policies/grants/RPC helper contracts. Existing owner/search_path/body hash không trả lời các câu này.

Evidence acquisition plan (NOT EXECUTED): ưu tiên migration source được cung cấp và sanitize, fingerprint khớp observed. Nếu không có, xin riêng scope đọc definition/policies/ACL/dependencies; duyệt cách sanitize trước chia sẻ, không dump secrets. Không query bổ sung bằng approval diagnostic cũ.

Target signup acceptance: new public.users identity/profile bound by verified UUID, Candidate/KYC=false; role khác không được tự chọn; exact/case email collision DEMO không chuyển id/ownership/role/KYC; duplicate Auth-linked bị chặn; profile failure rollback Auth insert; concurrency không double profile/orphan. Exactly one effective profile-creating handler trong final state, kể cả lúc migration cutover. Alternative handler chưa hiểu → HALT.

Không backfill hoặc merge theo email. Missing historical profile/binding là data migration question cần counts/preflight và proposal riêng; không tự sửa row. Global unique email chưa giải quyết nghĩa là target signup collision chưa được phép tuyên bố PASS.

## 3. Collation guard spec

Giữ deterministic/type/encoding/provider checks. Với email provider d, đọc recorded database version và pg_database_collation_actual_version(current_database), verify provider được support và actual default/database consistent. NULL own collversion không tự làm FAIL nếu database metadata hợp lệ; cũng không blanket-pass mọi NULL.

Với explicit ICU/libc, so sánh recorded/actual đúng collation object. Unknown provider, nondeterministic, missing metadata cần thiết hoặc real version mismatch → HALT trước mutation. Builtin/no-version provider chỉ hỗ trợ khi có test/spec riêng. Không refresh version, đổi locale/collation, reindex hoặc canonicalize email tự động. Không đổi lower/trim/email validation policy qua việc sửa guard.

Matrix test: d+matching database versions PASS; d+drift/missing required metadata FAIL; explicit matching PASS/drift FAIL; unknown/nondeterministic FAIL. Mock tests không thay PostgreSQL runtime. Provider Unicode/email parity vẫn gate riêng.

PostgreSQL catalog references: https://www.postgresql.org/docs/17/catalog-pg-collation.html ; https://www.postgresql.org/docs/17/catalog-pg-database.html

## 4. Retention gates

Current SET NULL giữ nguyên. Không Auth hard-delete qua API/UI/provider admin/manual fixture trong scope này. Không đổi FK hoặc cascade graph. Không implement soft-delete/lifecycle mới bằng suy luận từ quyết định tạm hoãn.

Retention unresolved: dữ liệu/profile/KYC/history cần giữ hay anonymize/xóa, retention duration, counterpart/audit ownership. Không tự chọn thời hạn hoặc policy pháp lý.

Detached row gate: auth_user_id NULL có thể là DEMO hoặc former Auth. Không suy luận NULL=DEMO, không auto-rebind theo email, không cho persona DEMO nhận dữ liệu former Auth. Nếu cần provenance/deactivation schema, trình proposal/spec riêng; chưa thêm cột. Existing detached data chưa inventory, nên đây là blocker implementation/data migration readiness, không chỉ hard-delete tests. Server/RLS phải fail closed khi không có verified binding; session cũ không được khôi phục identity bằng email.

Giữ SET NULL không đồng nghĩa đã được human duyệt retention dài hạn. CASCADE không được dùng để ép 007 pass. Approval sau này phải explicit trước mọi thay deletion policy.

## 5. Reconciliation sequence

1. Freeze observed evidence/schema fingerprints và expected contract; preserve 006/007/app/user work. Scope này hoàn tất tại spec, không thực hiện các bước sau.
2. Review SPEC và explicit evidence-acquisition scope. Thu thập trusted handler/full helper/RLS/ACL/FK graph definitions only if approved; drift → HALT.
3. Resolve detached provenance/data eligibility bằng kế hoạch được duyệt; không query user rows nếu chỉ metadata scope. Retention policy vẫn pending → no hard-delete, preserve SET NULL. Unknown provenance ảnh hưởng writes thì block.
4. Prepare future narrow reconciliation migration proposal: contract validation dưới lock trước DDL, explicit helper/RPC/ACL/policy changes, one-handler atomic cutover và preserved FK. Không blind execute policy-drop loop006, không create second handler or blanket revoke/drop unknown objects. Version/filename/order của reconciliation vs revised007 là implementation decision cần review; chưa tạo runnable migration.
5. Separate offline implementation approval để sửa artifacts/tests đúng phạm vi, không sửa historical006. Phương án sửa007 hay companion migration phải được explicit approve và align rollback baseline/trigger/FK guards; chưa cấp quyền từ spec.
6. Review offline diff/tests; separate test-database checkpoint cho data preflight, reconciliation, unique-email migration và fixtures từng bước. Lock/recheck preconditions, verify after-state fingerprints/effective ACL. Unexpected state/SQLerror → rollback/HALT, no auto-repair.
7. Run approved integration and rollback tests; report to ChatGPT. No deploy/LIVE or automatic next iteration.

## 6. Tests / rollback

| Test group | Acceptance (future approved execution only) |
|---|---|
| Before-state gates | Wrong object/body/owner/ACL/provider/FK/dependency HALT trước DDL; SET NULL recognized without converting CASCADE |
| Signup | Exactly one handler; Candidate/KYC=false; malicious metadata rejected; profile atomicity; DEMO/Auth collisions preserve relationships; concurrent duplicate prevented |
| Server/RLS | Invalid/expired sessions denied; two-user/wrong-owner access denied; Admin-only Employer grant; protected role/KYC/binding writes denied; display identity verified; legacy permissive OR leak absent |
| Collation | Provider/default cases above, genuine drift HALT; actual PostgreSQL/provider Unicode cases distinct from local tests |
| Detached identity | Former Auth never becomes DEMO/rebound; no implicit email recovery; unverified/null binding denied. No actual Auth deletion fixture under current policy |
| Rollback | Exact prior trigger/helper/policy/owner/ACL/index definitions restored only when fingerprints match; dependency drift HALT; collision blocks reverting global UNIQUE without deleting/merging data |
| Preservation | Existing public.users ids/role/KYC/ownership unchanged unless separately approved; untouched DEMO; HEAD/index/staged deletions retained |

Before mutation, approved snapshot of prior definitions/ACL/data scope and rollback artifacts required. Current hash-only evidence cannot reconstruct function body. DDL rollback cannot restore deleted rows; this scope performs no deletion. Future inverse migration is conditional, not automatic on arbitrary drift; no DROP CASCADE/reset/cleanup. Existing 007 rollback assumes baseline handler/CASCADE contract and is not accepted as reconciliation rollback proof.

## 7. Blockers / approval requests

- B1 source/semantics existing signup and full access/dependency contract unknown.
- B2 provider-aware guard design accepted conceptually; no implementation/runtime proof.
- B3 temporary exception SET NULL confirmed, but detached provenance/retention unresolved; CASCADE conversion forbidden.
- No approved data counts/binding provenance, reconciliation migration execution or integration fixtures.

Requests in order: spec acceptance; narrow evidence acquisition permission; provenance/retention policy where needed; narrow offline implementation; independent database migration/fixture/integration checkpoint. Spec acceptance grants none of the latter. SMTP/Auth enabling/production/admin dashboard/payment/lifecycle excluded.

Self-validation: five stable CAP IDs in kernel; mandatory seven sections present; human A/SET NULL/no-hard-delete preserved; evidence facts/unknowns/proposals separated. No tests executed in this document-only task. HEAD=96f4be8575718d50eab2285ab5241d1583f3423a; indexSHA256=2CCEC39D9D69A39044F41840197966E9D329EC3DEF5935BF7372CE342253888A preserved.
NEXT_EXPECTED_STEP: AUTH_RECONCILIATION_SPEC_READY — STOP for ChatGPT review.
