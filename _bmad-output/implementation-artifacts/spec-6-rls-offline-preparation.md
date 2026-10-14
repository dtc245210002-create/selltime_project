---
title: 'Iteration 6 — Chuẩn bị RLS integration offline'
type: 'maintenance'
created: '2026-10-10'
status: 'done'
baseline_commit: '96f4be8575718d50eab2285ab5241d1583f3423a'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="phạm vi offline được user phê duyệt">

## Intent

Chuẩn bị bộ file có thể review để kiểm tra migration 006 trên Supabase test riêng sau phê duyệt database. Không chạy SQL, tạo/truy cập database, dùng credential, cài công cụ hoặc deploy trong task này. Chỉ hoàn thiện artifact test và kế hoạch thực thi; kết thúc READY_FOR_DB_APPROVAL, không nghiệm thu Auth.

## Boundaries & Constraints

Giữ toàn bộ dirty work và staged deletion, HEAD; không commit/stash/reset/clean/restore/checkout. Không sửa migration, schema Supabase gốc hoặc ứng dụng. Chỉ chỉnh test SQL hiện có theo diff nhỏ và tạo artifact test/docs/offline validation mới. Không đọc credential hoặc .env. Không thay thế auth.uid/auth.users bằng mock để tuyên bố integration thật.

## Acceptance

- Given schema nền có DEMO seed, when chuẩn bị bootstrap test, then DDL/enums/indexes được giữ đồng nhất nhưng không có INSERT seed; có precondition môi trường Supabase thật và bảng SellTime trống/chưa tồn tại.
- Given suite RLS, when review offline, then positive cases về owner/profile/application/message và negative cases về spoof/role/financial columns được ghi rõ; assertion phải bắt row count tránh pass khi không có row.
- Given fixture namespace, when chạy sau phê duyệt, then preflight từ chối collision và hậu kiểm xác nhận rollback hết fixture; lỗi bất ngờ dừng qua ON_ERROR_STOP, có hướng dẫn hậu kiểm session mới.
- Given chưa duyệt database, when validation, then chỉ kiểm tra file tĩnh, không chạy SQL hoặc kết nối; báo giới hạn không chứng minh syntax/runtime/RLS.

</frozen-after-approval>

## Code Map

- `src/database/schema_supabase.sql`: 7 enums, users/candidate_profiles/employer_profiles/shifts/shift_applications/escrow_transactions, uuid-ossp; seed bắt đầu section 10.
- `src/database/migrations/006_auth_ownership.sql`: thêm conversations/messages, trigger Auth, security definer functions, replace policies/grants; BEGIN/COMMIT riêng; không chỉnh hoặc chạy.
- `src/database/tests/006_auth_ownership.sql`: fixture Auth A/B/Admin, DEMO; transaction rollback; đã có spoof shifts, cần mở rộng positives và column tests. UPDATE employer_profiles đang có thể bị reject bởi privilege nhưng cần fixture thực để positive profile update.

## Tasks & Acceptance

- [x] Tạo `src/database/tests/000_test_baseline.sql`: copy DDL nền trước section 10, giữ source không đổi; BEGIN/COMMIT, SET LOCAL search_path phù hợp public/extensions; guard auth dependencies và từ chối bảng/enum SellTime có sẵn, không seed; ghi rõ chỉ test disposable sau phê duyệt.
- [x] Mở rộng `src/database/tests/006_auth_ownership.sql`: preflight collision trước BEGIN; assert role authenticated không superuser/bypassrls; fixture employer profile và shift application của A cùng ca của B; positive owner profile updates, candidate profile update, member reads, applied shift/application read; negative cross-owner update và protected KYC/PIN/verified/financial fields; message name/avatar spoof; retain existing tests và không đổi kỳ vọng để pass.
- [x] Tạo `src/database/tests/006_verify_rollback.sql`: read-only DO checks fixture Auth UUIDs và namespace auth006- trên mọi bảng liên quan; gọi sau ROLLBACK và hướng dẫn chạy riêng sau failure. Chạy bootstrap/migration/suite trong psql sessions với ON_ERROR_STOP, tránh --single-transaction ngoài các BEGIN/COMMIT đã có.
- [x] Tạo `docs/rls-integration-test-plan.md`: dependency inventory, fixture matrix, file order, quyền role vs bootstrap, tool Windows đề xuất psql chính thức không cài server/service; cách bảo vệ credential không trên command line/log; approval cần project ref, bootstrap/migration/provision/test và cleanup; rollback fixture không rollback migration; không tự drop/reset DB.
- [x] Tạo `scripts/verify-rls-preparation.cjs`: static offline file checks bootstrap tương ứng DDL nền không seed, test transaction & rollback hook, không chạy shell/DB/network; thông báo giới hạn validation.

## Verification

Chạy node scripts/verify-rls-preparation.cjs; không chạy bất kỳ SQL. Application source/migration không thay đổi nên không lặp build/TypeScript vô ích. Diff kiểm tra và Git preservation trước/sau. Kết quả SQL NOT_RUN.

## Implementation Notes

Đây là tiếp tục Iteration 6 đã initializer thành công; scope offline mới được user phê duyệt, dùng rendered workflow hiện có. RLS execution vẫn chờ quyền riêng. Không ghi token vào tài liệu. Windows psql chỉ đề xuất, không cài. User cấm commit và task chỉ chuẩn bị nên không đánh dấu Auth done.

## Review Triage Log

Ba reviewer đã hoàn tất: edge không finding, gap không verification gap trong phạm vi offline. Blind findings được kiểm tra trước grouping:

| ID | Verdict | Route | Evidence |
|---|---|---|---|
| B01 | medium | patch | Sau revoke chỉ kiểm tra role; chưa thực thi UPDATE/INSERT Employer. Fixture profile A có sẵn cho kiểm tra denial. |
| B02 | medium | patch | Policy có OPEN/filled=0 nhưng negative inserts chưa kiểm tra từng điều kiện; fixture B cho phép thêm độc lập. |
| B03 | medium | patch | anon hiện chỉ kiểm tra users/RPC; grants các bảng/hàm còn lại có thể sai mà suite không phát hiện. |
| B04 | medium | patch | applications lifecycle và shifts UPDATE/DELETE chưa có denial assertions dù migration revoke. |
| B05 | medium | patch | Conversation mutation và messages UPDATE chưa kiểm tra; fixture hội thoại/tin hiện có đủ để thêm denial assertions. |
| B06 | medium | patch | UUID binding chỉ thử id bằng UUID nên không phân biệt lookup mapping với trả auth.uid trực tiếp. Bổ sung fixture mapping khác ID có thể thực hiện offline, không sửa migration. |
| B07 | medium | patch | Validator dùng substring nên comment chứa marker cũng PASS; phải mô tả chính xác là kiểm tra marker/cấu trúc tĩnh, không coverage thực thi. |

Tất cả là bổ sung assertion/test documentation offline, không tạo public surface hay thay policy. Re-engage implementation agent cho diff nhỏ; SQL vẫn NOT_RUN.

Patch verification: B01–B07 đã được bổ sung và primary đọc lại statements/role order, mapping FK và hậu kiểm UUID604. Static validator exit 0, node --check exit 0, git diff --check exit 0 (cảnh báo CRLF baseline). Chỉ spec chuẩn bị offline này done; spec Auth iteration 6 giữ in-review. NEXT_EXPECTED_STEP: READY_FOR_DB_APPROVAL rồi STOP. Không commit theo user.

## Spec Change Log

