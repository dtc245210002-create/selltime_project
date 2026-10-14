# C2C — Iteration 6 remediation

STATE: BLOCKED  
TASK_ID: c2c_a73f  
WORKSPACE: selltime_project  
WORKSPACE_ID: e9c367fdc841

AUTH-01: logout xóa cả hai cookie khi session không hợp lệ hoặc provider lỗi, sau kiểm tra Origin. Giữ nguyên admin.signOut. Refresh không hợp lệ cũng dọn cookie.

RLS-01: INSERT shifts buộc tên/avatar khớp hồ sơ owner liên kết Auth; thêm SQL cases spoof và matching-profile. Migration chưa áp dụng. Hồ sơ tự cập nhật không phải bằng chứng danh tính pháp lý.

VALIDATION: auth/security 17/17; regression 45/45; realpath 3/3; TypeScript exit 0; npm run build exit 0. EPERM không tái hiện; không khẳng định nguyên nhân permission đã được sửa. Log nằm cùng thư mục này.

RLS INTEGRATION: NOT_RUN. User xác nhận chưa có môi trường database được phê duyệt; không truy cập provider/database hoặc dùng credential.

CHANGED_FILES trong remediation: src/app/api/auth/[action]/route.ts; src/database/migrations/006_auth_ownership.sql; src/database/tests/006_auth_ownership.sql; src/__tests__/auth-ownership.test.mjs; docs/auth-ownership.md; _bmad-output/implementation-artifacts/spec-6-auth-and-ownership.md. Artifact mới: thư mục verification-6-remediation và deferred-work.md.

REVIEW: ba reviewer hoàn tất; từng finding đã ghi trong Review Triage Log. Có các vấn đề deferred của baseline về body buffering, shift validation, signup collision và consumer tests DEMO. Refresh outage có thể buộc login lại, cần review tradeoff. Không tuyên bố Iteration 6 đã nghiệm thu.

GIT: HEAD 96f4be8575718d50eab2285ab5241d1583f3423a giữ nguyên. Staged deletion src/Password-Supabase/New Text Document.txt giữ nguyên; file local vẫn tồn tại, không đọc nội dung. Không commit/stash/reset/restore/checkout/clean, không nâng quyền Administrator, không sửa credential.

NEXT_EXPECTED_STEP: STOP — ChatGPT review; database test cần phê duyệt riêng. Spec giữ in-review, không đánh dấu done hoặc commit theo step-05 vì điều kiện nghiệm thu và chỉ thị user.
