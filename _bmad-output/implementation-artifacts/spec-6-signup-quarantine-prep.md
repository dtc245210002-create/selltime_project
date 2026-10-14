---
title: 'Chuẩn bị quarantine signup và fake I/O offline'
type: 'chore'
created: '2026-10-14'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---
<frozen-after-approval reason="phạm vi offline human đã duyệt">
## Intent

Chuẩn bị cơ chế quyết định fail-closed dựa trên evidence quarantine và console giả, kết hợp fake-process stream tests đã nghiệm thu. Không probe hoặc tạo quarantine thật, không dùng psql/password/definitions thật. Signup derivative vẫn hard-disabled; SHA256 ghi rõ. Unknown roots, ACL, canonical/reparse/cloud evidence hoặc console fallback đều chặn readiness, không biến boolean synthetic thành chứng nhận live. Giữ HEAD/index/user work và STOP sau ChatGPT review.
</frozen-after-approval>

## Implementation Notes

- Route oneshot: footprint gồm module design gate, tests, signup SQL derivative khóa và báo cáo; không app dependency hoặc irreversible. Những unknown live là blockers đã biết, không tự chọn/đo chúng.
- Tái sử dụng private_collector_offline.py đã được nghiệm thu; không sửa core hoặc các SQL cũ đã khóa. Test fake process chỉ producer synthetic cố định.
- bmad-build initializer exit 0, workflow snapshot dcbdf2fb0dfa3b79d072, các bước/route oneshot đã đọc từ vòng trước. Dirty work đã được human cho phép bảo toàn. Không commit theo điều kiện human.
- Kiểm thử cuối 17/17 PASS, exit0; thêm sáu negative cases từ Blind Hunter. Collector core giữ nguyên hash, derivative signup vẫn khóa. Không xác minh quarantine/console thật.

## Review Triage Log

- medium / patch: synthetic_only truthy ⇒ yêu cầu đúng True, reject string/int.
- medium / patch: Windows path malformed ⇒ từ chối control/NUL, invalid components, reserved device và trailing dot/space.
- medium / patch: root nested candidate ⇒ kiểm tra containment cả hai chiều.
- medium / patch: disabled flag substring trong comment ⇒ kiểm tra đúng một active assignment false, không dùng comment làm gate.
- low / patch: malformed evidence/byte input exception ⇒ trả failure state cụ thể và negative tests.
- medium / patch: hash expected tính cùng bytes ⇒ positive test pin SHA256 độc lập và drift negative test. Hash manifest không phải authorization.
