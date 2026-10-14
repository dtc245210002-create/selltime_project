# C2C — Chuẩn bị RLS integration offline

STATE: READY_FOR_DB_APPROVAL  
TASK_ID: c2c_a73f  
ITERATION: 6  
WORKSPACE: selltime_project  
WORKSPACE_ID: e9c367fdc841

CHANGED_FILES:
- src/database/tests/000_test_baseline.sql: mới; DDL nền đồng nhất trước section 10, không seed, guard Supabase/bảng/enum.
- src/database/tests/006_auth_ownership.sql: bổ sung tests vào suite đã có; không xóa kỳ vọng cũ.
- src/database/tests/006_verify_rollback.sql: mới; read-only collision trước fixture và hậu kiểm sau rollback, cả namespace/FK/Auth UUID601–604.
- docs/rls-integration-test-plan.md: mới; dependency, fixtures, Windows psql ZIP và checkpoint quyền.
- scripts/verify-rls-preparation.cjs: mới; so sánh DDL và marker/cấu trúc file offline, không database/network.
- _bmad-output/implementation-artifacts/spec-6-rls-offline-preparation.md: spec chuẩn bị offline và triage.
- Thư mục verification-6-offline: báo cáo và log validation.

VALIDATION: node scripts/verify-rls-preparation.cjs exit 0; node --check exit 0; git diff --check exit 0. Ba review layers hoàn tất, bảy finding đã xử lý; primary đọc lại fixture/role order/assertions. Không chạy lại TypeScript/build vì không sửa ứng dụng. SQL/RLS integration NOT_RUN; static PASS không chứng minh syntax/runtime/coverage executable/RLS thật.

SECURITY: Không tạo/truy cập database, dùng credential, chạy migration, cài công cụ, deploy hoặc bật Auth LIVE. psql ZIP chỉ là đề xuất cần approval. Fixture tests dùng authenticated/anon; rollback checker đặc quyền có row_security off để báo lỗi nếu quyền không đủ, không âm thầm lọc residue. Không tắt RLS hoặc thay security policy.

GIT_STATUS: HEAD 96f4be8575718d50eab2285ab5241d1583f3423a. Git index SHA256 2CCEC39D9D69A39044F41840197966E9D329EC3DEF5935BF7372CE342253888A giữ nguyên, staged deletion giữ nguyên. Schema gốc SHA256 3C61C56F4C3B1258F3788126056E0B35B2056BFE5E775A07776650379775F983 và migration SHA256 7931DBBA940C8EAE6953C88E48098A9C436D6E43D6EC75C42E38E9C619E6B53A giữ nguyên. User dirty work bảo toàn; không commit/stash/reset/clean/restore/checkout.

APPROVAL_REQUIRED: project ref Supabase test riêng; quyền/tool psql và phương thức kết nối an toàn; bootstrap, migration 006, provision fixture đặc quyền, suite và hậu kiểm. Rollback fixture không hoàn tác bootstrap/migration COMMIT. Không tự drop/reset database.

NEXT_EXPECTED_STEP: STOP. Chờ DB approval. Iteration 6 chưa được nghiệm thu.
