---
title: 'Iteration 6 — Signup collision offline'
type: 'bugfix'
created: '2026-10-13'
status: 'done'
route: 'dispatch'
baseline_commit: '96f4be8575718d50eab2285ab5241d1583f3423a'
review_loop_iteration: 0
context:
  - 'C:/Users/admin/OneDrive/Desktop/selltime_project/_bmad-output/specs/spec-signup-collision/SPEC.md'
  - 'C:/Users/admin/OneDrive/Desktop/selltime_project/_bmad-output/specs/spec-signup-collision/migration-and-rollback.md'
  - 'C:/Users/admin/OneDrive/Desktop/selltime_project/_bmad-output/specs/spec-signup-collision/tests-and-normalization.md'
---

<frozen-after-approval reason="Human tiếp tục; C2C EXECUTE_APPROVED_OFFLINE">

## Intent

Chuẩn bị implementation offline CAP-1..CAP-4 của spec trong context: migration 007 cho email Auth-linked unique theo lower(email), SQL/local tests và rollback artifacts. DEMO/Auth cùng email vẫn tách UUID/role/KYC/ownership. Đây là chuẩn bị file, chưa chứng minh SQL runtime.

## Boundaries & Constraints

Luôn giữ dirty work, staged deletion, HEAD/index; đọc trước sửa. Không sửa 006/baseline/fixtures cũ hoặc tài liệu canonical spec. Không database/provider/network requests, credential, SQL execution, Git mutations, cài dependency, deploy/LIVE, đổi iteration hoặc normalization policy. Tạo SQL mới với guard/lock/transaction/dependency checks và rollback conditional; không backfill/merge/delete/rename dữ liệu. SQL/provider/concurrency/Unicode integration = NOT RUN. Lỗi scope/conflict/gap phải HALT. Ghi tài liệu tiếng Việt.

</frozen-after-approval>

## Code Map

- `src/database/migrations/006_auth_ownership.sql`: trigger/identity/role/RLS giữ nguyên; `schema_supabase.sql`, `tests/000_test_baseline.sql` giữ nguyên.
- `src/infrastructure/auth/server.ts`: auth_user_id lookup; không đổi.
- `src/app/api/auth/[action]/route.ts`: trim/120/role guard; chỉ đổi nếu bằng chứng buộc phải đổi, không mở policy.
- `src/__tests__/auth-ownership.test.mjs`: harness mock không network; ưu tiên tests mới, không phá suite cũ.
- Context companions chứa migration dependencies, rollback và matrix chi tiết; gate runtime chưa được cấp.

## Tasks & Acceptance

- [x] `src/database/migrations/007_auth_email_uniqueness.sql`: DDL chuẩn bị, kiểm tra shape/binding/duplicates/normalization/dependencies, lock/recheck, partial index trước bỏ constraint; fail-closed definition mismatch, không giả định constraint name/CASCADE.
- [x] `src/database/tests/007*`: collision/role/ownership/invalid/rollback/preflight/Unicode artifacts; concurrency hai session hướng dẫn rõ; không chạy SQL.
- [x] `src/__tests__/signup-collision.test.mjs`, `scripts/verify-signup-preparation.cjs` (hoặc tên tương đương): tests API thật transpile với provider mock và kiểm tra SQL tĩnh; gắn từng nhóm matrix, không giả lập SQL rồi tuyên bố runtime PASS.
- [x] `docs/signup-collision-offline.md`: run order, planned approved test target, guards/normalization/rollback/evidence và trạng thái NOT RUN. Không lệnh auto-connect/credential.
- [x] Chạy verification local; ghi artifacts mới tại `_bmad-output/implementation-artifacts/verification-6-signup-offline/`; bảo toàn Git và các files cũ.

AC: Given artifacts offline, when static/local tests chạy, then guards/cases trong matrix có coverage tĩnh hoặc local phù hợp và runtime cases có artifact/hướng dẫn, NOT RUN. Given dirty work, when hoàn tất, then chỉ file cần scope đổi, hashes 006/baseline và HEAD/index giữ nguyên. Given review xong, then gửi báo cáo ChatGPT và STOP trước DB.

## Implementation Notes

Initializer bmad-build đã chạy thành công; dùng snapshot hiện có. Không intent gap/irreversible execution; footprint nhiều artifact nên dispatch. Dirty checkpoint đã duyệt; ba design decisions và spec đã review, user cho tiếp tục, ChatGPT cấp scope offline; không hỏi lại approval. Context/spec cổ vẫn nói chưa implementation vì bản ghi lượt spec, scope hiện tại chỉ cấp offline như trên.

## Spec Change Log

## Review Triage Log

- B1 — medium, defer: refresh provider error chuyển 401 và catch dọn cookies; mất khả năng retry session khi lỗi tạm thời. Auth route giữ hash cũ, ngoài offline 007.
- B2 — medium, defer: logout expired-token branch chỉ clear cookie, không gửi remote revoke vì authenticate thất bại; còn cần provider session evidence. Không thay admin.signOut theo namespace.
- B3 — medium, defer: trigger chỉ Auth INSERT, provider email update có thể làm public.email stale; email-change lifecycle là explicit non-goal, không tự sync/đổi policy.
- B4 — medium, patch: JS regex chấp nhận U+0085 trong email, SQL guard explicit loại nó. Đã bỏ exclusion bổ sung, cập nhật rollback fingerprint/static và test signup/login giữ nguyên input. Local 9/9; locale/provider/SQL parity vẫn NOT RUN.
- B5 — medium, defer: wage/duration/budget có thể độc lập; formula/overnight là explicit non-goal đã chốt.
- B6 — medium, defer: INSERT shifts RLS 006 không có CHECK numeric/time/list tương đương API. 006 giữ nguyên theo scope; database hardening cần vòng riêng.
- B7 — medium, defer: applied IDs persist nhưng booking times không persist; cancellation dùng thời điểm mới nếu thiếu timestamp. DEMO lifecycle cũ.
- B8 — medium, defer: completed statuses persist trong khi wallet/trust reset; DEMO snapshot không atomic. Không payment thật.
- B9 — medium, defer: JSON hợp lệ sai shape/null được gán trực tiếp vào state, có thể crash includes/indexing; code cũ đã đọc lại.
- B10 — medium, defer: core tests tái tạo công thức/guard và metadata tại test, không gọi real checkout/callback/interview; đồng nhất evidence G1/G2, không phải test signup mới.
- E1 — maybe-false (high nếu đúng), defer: REVOKE table privilege không đảm bảo xóa column grants cũ, nhưng chưa chứng minh target có protected column grants. Cần catalog ACL và integration với fixture column GRANT trước 006; không tự sửa 006 hoặc truy cập DB.
- E2 — medium, defer: carried root cause B9 — storage không validate shape; loại JSON.parse error catch không bảo vệ valid null/object.
- E3 — medium, defer: app setSosLockUntil trực tiếp có thể ghi lock ngắn hơn lên lock dài hiện có; lifecycle cũ.
- E4 — medium, defer: hai callbacks trước re-render cùng thấy closure status chưa COMPLETED, có thể cộng DEMO rewards hai lần; verify guard chỉ dùng state cũ.
- E5 — medium, defer: carried B7/B8 — storage snapshot không giữ đồng bộ wallet/trust/booking/new shifts với statuses.
- E6 — medium, defer: description chỉ kiểm length, number/object có thể qua và repo gửi TEXT; ngoài input email task này.
- E7 — medium, defer: domain FULL_TIME khác API/SQL INTERNSHIP; enum parity cũ, không tự đổi business type.
- E8 — medium, defer: set_employer_role chỉ đổi role, không provision employer_profiles; 006/signup defaults cũ, scope giữ nguyên.
- E9 — medium, defer: AiCoach catch ghi fallback metadata nhưng không sinh fallback content; code cũ.
- E10 — medium, defer: messages limit 150 không cursor/truncation; pagination ngoài contract hiện tại.
- E11 — medium, defer: shifts limit 100 không cursor/truncation; pagination ngoài contract hiện tại.
- G1 — medium, defer: gap layer đã trace test arithmetic/idempotency không execute CheckoutModal/HomeContent; pre-existing DEMO consumer verification thiếu.
- G2 — medium, defer: gap layer đã trace metadata objects tự tạo không execute conductInterviewStep/route; AI contract verification cũ thiếu.
- G3 — medium, defer: gap layer không tìm executable MessagesTab test cho zero network/persona storage isolation; DEMO consumer verification ngoài scope.

Review chạy đủ Blind/Edge/Verification Gap. Diff so với HEAD có baseline dirty và untracked code/docs; loại credentials/.env/.txt, output cá nhân, binaries và operational logs để tuân thủ phạm vi bảo mật. Không git add. Các finding cũ được ghi, không dùng làm lý do sửa user work. B4 và metadata test-target trong docs đã patch; không root-cause nhóm intent_gap/bad_spec chưa giải quyết trong phạm vi offline.

## Verification

Tests mới + `node src/__tests__/auth-ownership.test.mjs`, `node src/__tests__/request-body.test.mjs`, `node src/__tests__/selltime-core.test.mjs`, `node --test src/__tests__/build-realpath.test.cjs`, `node node_modules/typescript/bin/tsc --noEmit --incremental false`, `npm run build`. Static/offline script exit 0. Không SQL runner/database. Build EPERM có thể retry đúng lệnh qua quyền môi trường, không xóa .next/ACL/Admin.
