---
title: 'Iteration 6 — Giới hạn request body theo byte'
type: 'bugfix'
created: '2026-10-12'
status: 'done'
route: 'oneshot'
baseline_commit: '96f4be8575718d50eab2285ab5241d1583f3423a'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="hardening local theo quyền user đã cho phép">

## Intent

Sửa readBody hiện buffer toàn bộ request trước khi kiểm tra giới hạn. Đọc stream tối đa 32768 byte, từ chối 413 và hủy stream khi vượt giới hạn, kể cả không có hoặc khai sai Content-Length. Giữ response 400 cho JSON không hợp lệ/không phải object, hành vi JSON UTF-8 bình thường và các guard Auth/Origin hiện có. Chỉ sửa policy và bổ sung tests local; giữ user work/Git/credential và checkpoint database, không thay migration hoặc bật LIVE.

</frozen-after-approval>

## Implementation Notes

Tiếp tục Iteration 6; initializer đã thành công, dùng snapshot workflow đã render. Gate dirty working tree đã được user chấp thuận với điều kiện bảo toàn. Scope nhỏ, không irreversible/intent gap nên route oneshot không có checkpoint phê duyệt mới. Không commit theo user. Deferred hardening khác và RLS integration vẫn giữ trạng thái chưa nghiệm thu.

Kiểm thử cần byte UTF-8 ở/vượt biên, split multibyte, thiếu/khai sai header, stream cancellation, JSON sai/empty/array/null; API security/regression/typecheck/build chạy local. Không request database/provider thật. Ghi log riêng, không ghi đè evidence cũ.

Đã sửa `src/infrastructure/auth/policy.ts`: đếm byte trong khi đọc stream, ngừng/hủy khi vượt giới hạn; không giữ chunk rỗng, copy chunk hợp lệ để tránh alias buffer, không đợi cancellation treo. JSON UTF-8 được decode sau khi ghép dữ liệu trong giới hạn. Bổ sung `src/__tests__/request-body.test.mjs` với 8 trường hợp.

Validation: request body 8/8; Auth 17/17; regression 45/45; realpath 3/3; TypeScript exit 0; npm run build exit 0. Evidence tại `verification-6-body-hardening/`. Không database/provider thật được gọi bởi tests. Build dùng cấu hình local hiện có, không đọc hoặc ghi credential trực tiếp.

Review oneshot dùng Blind Hunter context-free; không có lớp khác trong route này. Reviewer đọc cả dirty baseline và đưa 10 phát hiện thuộc mã có sẵn, không liên quan thay đổi bounded body. Không commit theo chỉ thị user. Iteration 6 tổng thể vẫn in-review, RLS integration chưa chạy.

## Review Triage Log

- B1 — medium, defer: migration cấp INSERT shifts và policy chỉ ràng buộc ownership/identity/lifecycle; baseline shifts thiếu CHECK wage/coords/duration. Chưa sửa migration trong task local này.
- B2 — medium, defer: regex giờ trong API shifts chấp nhận 99:99; start/end/duration độc lập. Cần quy tắc overnight/duration rõ trước thay đổi semantics.
- B3 — medium, defer: Number.isSafeInteger cho wage/budget vượt PostgreSQL INT; baseline dùng INT, repo chuyển lỗi insert sang 503. Giới hạn kiểu dữ liệu cần bổ sung riêng.
- B4 — medium, defer: conversations participants/messages.sender_id không có ON DELETE, chặn cascade xóa users có lịch sử. API chưa cung cấp account deletion; cần quyết định lưu trữ/anonymization trước bổ sung lifecycle.
- B5 — medium, defer: users.email UNIQUE và handle_auth_signup INSERT mới gây collision với email DEMO unbound. Không tự liên kết DEMO hoặc thay dữ liệu/credential.
- B6 — low, defer: auth/page.tsx xóa identity state trên mọi HTTP lỗi, kể cả 503 của session check/refresh sau đăng nhập; không xóa cookie ở client. Ảnh hưởng UX có sẵn, không phải lỗi nâng quyền; sửa nhỏ trong scope UI sau.
- B7 — medium, defer: catch AiCoach chỉ ghi metadata fallback, không tạo nội dung; CV đọc JSON mà không kiểm tra res.ok. Có sẵn trong user work.
- B8 — low, defer: DEMO reset setMessages([]), xóa key rồi persistence effect ghi [] lại; text hứa trở về trạng thái ban đầu. Có sẵn, sửa nhỏ riêng khi xử lý DEMO.
- B9 — low, defer: effect DEMO setLastMessagesMap({}) khi chuyển hội thoại, bỏ preview đã gửi; cached history không khôi phục preview. Có sẵn, sửa UI riêng.
- B10 — medium, defer: messages limit 150 và shifts limit 100, không cursor/truncation flag; API không truy xuất bản ghi cũ. Pagination thêm API contract ngoài task này.
