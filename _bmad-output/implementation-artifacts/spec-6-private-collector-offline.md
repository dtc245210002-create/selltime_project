---
title: 'Collector synthetic cách ly output cho bằng chứng signup'
type: 'chore'
created: '2026-10-14'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---
<frozen-after-approval reason="phạm vi offline do human duyệt">
## Intent

Chứng minh một collector offline có thể giữ stdout/stderr riêng, hạn chế dung lượng, bảo toàn output dở dang và native exit khi lỗi. Chỉ chạy producer synthetic cố định; không có đường chạy PostgreSQL, credential hay definitions thật. Không tạo quarantine thật hoặc thay ACL/connector. Bằng chứng public chỉ gồm trạng thái, số byte, hash và exit; không tự phát hành nội dung. Giữ toàn bộ HEAD/index/user work; không commit. Quarantine thực tế và quyền thu thập một signup function là checkpoint riêng sau review.
</frozen-after-approval>

## Implementation Notes

- Route oneshot: một công cụ offline độc lập với app, không có quyết định business chưa chốt và không có thao tác không thể hoàn tác. Ba file mới: collector Python, tests Python, báo cáo quarantine/approval. Mock artifacts chỉ chứa chuỗi synthetic. Không sửa các draft đã khóa hash.
- Tái sử dụng manifest/hash và yêu cầu F-function để đối chiếu; simulator cũ chỉ mock exit nên không đủ bằng chứng stream isolation.
- Kiểm thử bằng producer OS subprocess thật với stdout/stderr riêng, CreateNew, output overflow, timeout/partial, native 0/2/3, report failure; không chạy test app vì không thay source SellTime.
- bmad-build initializer exit 0; workflow snapshot dcbdf2fb0dfa3b79d072. Dirty checkpoint đã được human cho phép bảo toàn từ trước; không xin lại. Bỏ bước commit của skill vì human cấm Git mutations.
- Triển khai và kiểm thử sau review: 26/26 PASS, exit 0. Queue put có cancellation và shutdown deadline; flush/close/preparation/persistence lỗi có kết quả structured. Khi disk không thể lưu native.exit.txt, native exit vẫn trả cho caller kèm native_exit_saved=false; không tuyên bố đã lưu thành công.

## Review Triage Log

- medium / patch: lỗi flush/close vượt cleanup ⇒ từng resource được đóng trong guard độc lập; test flush/close giữ native 0.
- medium / patch: pump queue đầy khi consumer lỗi ghi ⇒ enqueue cancellation-aware; test dual-pressure + disk-write fault xác nhận threads dừng, bounded completion.
- medium / patch: native exit file lỗi mất result ⇒ result giữ native 3, native_exit_saved=false, gate NATIVE_EXIT_SAVE_FAILED; kiểm thử fault persistence.
- low / patch: source hash/mkdir/collision setup lỗi unhandled ⇒ PREPARATION_FAILED trước launch; source/mkdir fault tests.
- medium / patch: thiếu test stream/disk/process lỗi ⇒ thêm read/write/flush/close/launch/native/status persistence fault tests.
- medium / patch: thiếu concurrent pressure và exact boundary ⇒ producer synthetic hai stream áp lực, exact 8192/above 8192 và shutdown deadline assertions.
