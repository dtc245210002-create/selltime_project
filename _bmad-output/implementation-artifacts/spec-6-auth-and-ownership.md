---
title: 'Iteration 6 — Supabase Auth & Ownership'
type: 'feature'
created: '2026-10-08'
status: 'in-review'
baseline_commit: '96f4be8575718d50eab2285ab5241d1583f3423a'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Vấn đề:** API shifts hiện đọc/ghi database mà không xác minh session; API messages tin sender/conversation do client gửi và dùng kênh công khai. Persona DEMO không được trở thành tài khoản thật.

**Hướng giải quyết:** Supabase xác minh danh tính ở server; hồ sơ liên kết Auth UUID cung cấp role và ownership. API và RLS cùng bảo vệ dữ liệu. Giữ nguyên Candidate/Employer DEMO; tài khoản thật có khu vực riêng.

## Boundaries & Constraints

**Luôn:** giữ dirty work, staged deletion và untracked files; kiểm tra diff trước khi sửa. Auth dùng cấu hình cô lập riêng, mặc định tắt. Client theo session đã xác minh; role từ database được bảo vệ; Admin chỉ cấp qua quản trị tin cậy. Owner/sender từ session.

**Không:** sửa credential/Git; dùng credential cũ; áp dụng migration, deploy, live seed, payment/lifecycle/Admin Dashboard. Không fallback dữ liệu thật sang SQL Server/memory; không đưa session thật vào DEMO, ntfy hoặc cache chung.

**Quyết định đã chốt:** Email/Password qua Supabase Auth thật, xác minh session ở server; không lưu password plaintext. OTP/Magic Link ngoài phạm vi. Đăng ký luôn Candidate; chỉ Admin đã xác minh được cấp/thu hồi Employer qua API/RLS. Không tự chọn Employer, tự nâng quyền hoặc đăng ký Admin. Không truy cập database hay dùng credential khi chưa được duyệt riêng.

## I/O & Edge-Case Matrix

| Tình huống | Đầu vào | Hành vi | Lỗi |
|---|---|---|---|
| Chưa xác thực | Không có token, token giả/hết hạn | Từ chối dữ liệu thật | 401 |
| Sai role | Candidate đăng ca | Không ghi dữ liệu | 403 |
| Giả owner | ID người khác | Server xác định owner; không upsert | 403; ID trùng: 409 |
| Sai hội thoại | Không phải thành viên | Không đọc/gửi/xóa | 404 |
| Nâng quyền | ADMIN/thay role | Không thay quyền database | 403 |
| Cấp/thu hồi Employer | Admin đã xác minh | RPC kiểm tra Admin; session tiếp theo đọc role mới | Người khác: 403 |
| DEMO | Persona hoặc role từ trình duyệt | Chỉ thao tác local; không tạo session thật | API vẫn yêu cầu Auth |
| Cấu hình thiếu | Auth chưa bật/thiếu cấu hình riêng | Không gọi database; không fallback | 503 |

</frozen-after-approval>

## Code Map

- `src/infrastructure/database/supabaseClient.ts`, `supabaseRepo.ts`: singleton và upsert chưa kiểm tra owner.
- `src/app/api/shifts/route.ts`, `messages/route.ts`: chưa Auth; fallback/database hoặc ntfy công khai.
- `src/database/schema_supabase.sql`: users.id VARCHAR, chưa liên kết auth.users; không bind seed DEMO.
- `src/app/page.tsx`, `AuthModal.tsx`, `RoleSwitcher.tsx`, `MessagesTab.tsx`: giữ dirty baseline DEMO; không bật chat non-demo cũ.
- `src/domain/types.ts`: tái sử dụng enum UserRole; tạo kiểu danh tính xác minh riêng.

## Tasks & Acceptance

**Execution:**
- [x] `src/infrastructure/auth/server.ts`, `policy.ts` — client theo request, xác minh qua auth.getUser, cookies bảo vệ, role/profile binding, kiểm tra origin cho mutation và lỗi fail-closed.
- [x] `src/app/api/auth/[action]/route.ts`, `src/app/auth/page.tsx` — signup/login/logout/refresh/session và API cấp/thu hồi Employer chỉ Admin; không log token/password.
- [x] `src/components/AuthModal.tsx` — thêm lối vào khu vực tài khoản riêng, giữ nguyên đăng nhập DEMO không password.
- [x] `src/infrastructure/database/supabaseRepo.ts`, `src/app/api/shifts/route.ts` — truyền client đã xác minh, owner server, insert an toàn, role guard và không fallback.
- [x] `src/app/api/messages/route.ts` — kiểm tra thành viên, sender server, giới hạn input; bỏ ntfy/memory thật và endpoint reset chat không được bảo vệ.
- [x] `src/database/migrations/006_auth_ownership.sql` — binding UUID unique, signup Candidate, RPC cấp/thu hồi Employer chỉ Admin; RLS users/profiles/shifts/applications/messages/conversations; khóa tài chính. Chỉ review, không áp dụng.
- [x] `.env.example`, `docs/auth-ownership.md` — placeholder cấu hình riêng, default-off, hướng dẫn môi trường test, Admin provisioning, migration và hạn chế kiểm thử.
- [x] `src/__tests__/auth-ownership.test.mjs`, `src/database/tests/006_auth_ownership.sql` — unauthorized, hai tài khoản, wrong owner, escalation, DEMO isolation; không gọi provider trong unit tests.

**Acceptance Criteria:**
- Given hai tài khoản khác nhau, when truy cập dữ liệu riêng của nhau qua API/RLS, then không lộ hoặc sửa dữ liệu.
- Given session hợp lệ, when lấy hồ sơ, then Auth UUID và role do server/database xác minh, không phụ thuộc role trình duyệt.
- Given giao diện DEMO hiện tại, when chuyển Candidate/Employer và dùng ca/chat mẫu, then hoạt động local như baseline.
- Given database test chưa được xác minh, when validation, then không dùng credential cũ; báo RLS integration chưa chạy.

## Implementation Notes

### Sửa blocker sau review — 2026-10-10

User đã cho phép khắc phục năm blocker. Giữ nguyên intent đã đóng băng và `admin.signOut`; không dùng service-role, không tự áp dụng migration hoặc truy cập database chưa được duyệt. Đây là tiếp tục workflow đã khởi tạo, không chạy lại initializer.

- Logout có Origin hợp lệ phải xóa access/refresh cookies khi session thiếu, giả, hết hạn, malformed hoặc provider thất bại. Session không hợp lệ được coi là đã logout cục bộ; lỗi provider vẫn trả lỗi sau khi dọn cookie.
- RLS INSERT shifts yêu cầu tên/avatar khớp `users` của owner liên kết Auth. SQL tests kiểm tra riêng giả owner, tên và avatar; không suy diễn unit mock là bằng chứng RLS thật.
- Bổ sung kiểm thử Cookie login → session → refresh → logout, invalid session và provider failures. Sai Origin không được xóa cookie.
- Chạy lại typecheck/security/regression/realpath/build; giữ log mới riêng, không ghi đè evidence cũ.
- RLS integration vẫn cần database test được xác minh và quyền riêng. Nếu không có môi trường đó, báo BLOCKED cho hạng mục này.

## Spec Change Log

## Review Triage Log

Review remediation 2026-10-10: ba reviewer đã hoàn tất trước khi triage. Diff tích lũy có cả user work trước vòng sửa; các vấn đề dưới đây không được coi là regression do remediation nếu mã liên quan không đổi trong vòng này.

| ID | Verdict | Route | Evidence |
|---|---|---|---|
| Blind-01 | medium | defer | `page.tsx` khôi phục status nhưng wallet/trust khởi tạo lại; lỗi DEMO có sẵn, lifecycle/payment được intent loại khỏi vòng này. |
| Blind-02 | medium | defer | Persistence lưu applied IDs nhưng không lưu appliedTimestamps hoặc ca mới; lỗi DEMO có sẵn. |
| Blind-03 | medium | defer | Checkout kiểm tra status từ closure trước các state setter; hai callback cùng render có thể cộng hai lần. Mã user work không đổi trong remediation. |
| Blind-04 | medium | defer | Regression chỉ kiểm tra trạng thái tự tạo, không gọi checkout consumer; khoảng trống baseline được verification reviewer xác nhận. |
| Blind-05 | medium | defer | Regex giờ cho phép 99:99; ngày chỉ boundedString, duration không đối chiếu. Route không đổi trong remediation. |
| Blind-06 | medium | defer | Route nhận total_budget độc lập với wage/duration/headcount; quy ước tài chính chưa được xác định trong Auth remediation. |
| Blind-07 | high | defer | `readBody` gọi req.text trước giới hạn thực tế; streamed body không Content-Length có thể dùng nhiều bộ nhớ. Có sẵn trong policy, không sửa trong vòng này; cần giải quyết trước LIVE. |
| Blind-08 | medium | defer | Refresh fail-closed xóa cookie khi verifyToken gặp outage, có thể yêu cầu đăng nhập lại. Đây là tradeoff của session lifecycle cần ChatGPT review trước nghiệm thu; không giữ token chưa xác minh để tránh suy diễn quyền. |
| Blind-09 | false | reject | Hai caller MessagesTab hiện dùng default demoOnly=true; effect và send return trước ntfy/API. Nhánh false tồn tại nhưng không phục vụ tài khoản thật ở giao diện hiện tại. |
| Blind-10 | medium | defer | users.email UNIQUE và signup trigger INSERT tạo collision với hồ sơ DEMO chưa bind; migration có sẵn trước remediation. Không tự liên kết DEMO hay thay schema chưa duyệt. |
| Blind-11 | low | defer | Catch AiCoach ghi metadata fallback dù không có nội dung fallback trả về; mã user work có sẵn, không thuộc Auth. |
| Edge-01 | high | defer | Cùng req.text không giới hạn buffering như Blind-07; cần bounded byte stream trước khi bật LIVE. |
| Edge-02 | medium | defer | Domain WorkType có FULL_TIME nhưng SQL/API có INTERNSHIP; parity có sẵn, không đổi trong remediation. |
| Edge-03 | medium | defer | Validation giờ chỉ regex, duration độc lập, cùng vấn đề Blind-05. |
| Edge-04 | medium | defer | Number.isSafeInteger cho phép số lớn hơn PostgreSQL INT; insert thất bại được map 503. Có sẵn trong route. |
| Edge-05 | medium | defer | total_budget chưa tính theo wage/duration/bonus, cùng Blind-06. |
| Edge-06 | medium | defer | JSON.parse không kiểm tra shape trước setters; stored null có thể làm render lỗi. User DEMO work có sẵn. |
| Edge-07 | medium | defer | setSosLockUntil ghi lock mới không lấy max với lock cũ, có thể rút ngắn lock. Lifecycle có sẵn, ngoài intent. |
| Gap-01 | high | defer | SQL có spoof name/avatar và matching-profile cases nhưng chưa chạy trên database thật. User xác nhận chưa có môi trường được duyệt; blocker nghiệm thu vẫn mở. |
| Gap-02 | medium | defer | Không có component/browser test DEMO chat; mock API test không thực thi MessagesTab. Khoảng trống baseline. |
| Gap-03 | medium | defer | Test checkout tính fixture, không gọi callback wallet/trust thật; khoảng trống baseline cùng Blind-04. |

Không có finding cần sửa thêm vào user work trong vòng remediation này. Refresh outage được giữ để review riêng về tradeoff, không coi là đã được nghiệm thu. SQL fixture avatar đúng đã được đặt sau test duplicate ID để tránh thay hồ sơ làm sai điều kiện của test trước. Status giữ `in-review` vì RLS integration chưa được duyệt và ChatGPT chưa nghiệm thu. Không thực hiện commit của step-05 vì user cấm commit.

## Verification

- `node node_modules/typescript/bin/tsc --noEmit --incremental false` — không lỗi.
- `node src/__tests__/selltime-core.test.mjs` — regression baseline 45/45.
- `node --test src/__tests__/build-realpath.test.cjs` — 3/3.
- Bộ security tests mới — unauthorized/cross-user/escalation/DEMO đều đạt.
- `npm run build` — thành công; không gửi request production.
- RLS SQL tests chỉ trên database test được xác minh; ghi log và summary C2C iteration 6.


