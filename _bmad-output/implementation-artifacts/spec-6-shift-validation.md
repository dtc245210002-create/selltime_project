---
title: 'Iteration 6 — Validation giờ và tiền của shifts API'
type: 'bugfix'
created: '2026-10-12'
status: 'done'
route: 'oneshot'
baseline_commit: '96f4be8575718d50eab2285ab5241d1583f3423a'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="EXECUTION_SCOPE_APPROVED c2c_a73f Iteration 6">

## Intent

Shifts POST chỉ chấp nhận giờ dạng string HH:mm từ 00:00 đến 23:59, không coercion kiểu dữ liệu. hourly_wage và total_budget phải là số nguyên dương không vượt 2147483647; sos_bonus_amount nếu có phải là số nguyên không âm không vượt 2147483647. Trả 400 trước insert khi input sai; các giá trị biên hợp lệ giữ response 201 và giá trị gửi nguyên vẹn. Bổ sung tests API local cho negative/boundary và chạy security/regression/TypeScript/build. Giữ toàn bộ user work và staged deletions. Không logic qua đêm, quan hệ duration, budget formula, signup collision, database/migration, credential, deploy hoặc Git mutations.

</frozen-after-approval>

## Implementation Notes

Workspace C2C CLI xác nhận selltime_project / e9c367fdc841 và root đúng. HEAD/index trùng baseline lượt trước; đã đọc route/tests và lưu snapshot trước sửa. Tiếp tục workflow đã render sau initializer thành công, không chạy lại initializer. Route oneshot cho sửa nhỏ với scope/biên đã duyệt, không có câu hỏi nghiệp vụ. Dirty checkpoint đã được user duyệt; không commit theo chỉ thị user.

Code: src/app/api/shifts/route.ts; tests: src/__tests__/auth-ownership.test.mjs. Evidence mới tại verification-6-shift-validation/. Tests dùng provider/database giả lập; RLS integration thật vẫn chưa chạy.

Đã thêm helper private isTime với type string/length 5 và range HH:mm; MAX_MONEY áp dụng đúng ba trường hourly_wage/total_budget/sos_bonus_amount, giữ nguyên dấu và optional rules. 6 nhóm test mới chạy 85 POST bổ sung (67 từ chối, 18 hợp lệ), assert không insert khi 400 và giá trị biên giữ nguyên khi 201. Snapshot và delta riêng lưu cạnh logs, không ghi đè user work.

Security 23/23, body 8/8, regression 45/45, realpath 3/3, TypeScript exit 0. Build sandbox exit 1 do EPERM mkdir .next/server/app/api/auth; retry đúng npm run build ngoài sandbox qua quyền môi trường, không Administrator/ACL/cleanup, exit 0. Cả hai output được giữ. Không commit theo user.

Blind Hunter context-free là lớp review duy nhất của route oneshot. Reviewer xét cả baseline dirty, không phát hiện lỗi do thay đổi giờ/INT max. Các phát hiện có sẵn được phân loại và append deferred-work; không mở rộng scope đã duyệt.

## Review Triage Log

- B1 — medium, defer: route.before xác nhận description chỉ kiểm tra length; number/object có thể qua và repo gửi TEXT. Có sẵn, không phải lỗi do hour/money change; cần task validation field khác.
- B2 — medium, defer: repo gửi cover_image trực tiếp; route không runtime type/size check từ trước. Giới hạn hình cần scope khác.
- B3 — medium, defer: shifts INSERT RLS chỉ kiểm tra ownership/identity/lifecycle; CHECK database chưa tương đương validation API. Database/migration bị loại khỏi scope, ghi rõ chưa bảo vệ direct insert bằng giới hạn mới.
- B4 — medium, defer: users.email UNIQUE, trigger signup INSERT vào cùng bảng DEMO; collision có sẵn, explicit out of scope.
- B5 — medium, defer: trigger tạo candidate_profiles, set_employer_role chỉ đổi role; employer_profiles không có INSERT grant. Thiếu provisioning thật; task này không thay role/profile/migration.
- B6 — medium, defer: FK conversations participants/messages sender không deletion action, cascade Auth-to-users có thể bị chặn khi có lịch sử. Account retention/anonymization là quyết định lifecycle ngoài phạm vi.
- B7 — medium, defer: AiCoach catch gắn local fallback metadata mà không sinh fallback nội dung; có sẵn trong user work.
- B8 — medium, defer: CV parse JSON/setCvResult trước kiểm tra res.ok; HTTP lỗi có thể thành result; code có sẵn.
- B9 — low, defer: auth/page HTTP error luôn setIdentity(null), 503 tạm thời mất identity hiển thị; không mất quyền server, có sẵn, cải thiện UI riêng.
- B10 — medium, defer: messages limit 150 và shifts limit 100 không cursor/truncation indicator; bản ghi cũ không truy cập được, pagination ngoài API contract task này.
