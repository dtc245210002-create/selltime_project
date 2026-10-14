# Auth và ownership — iteration 6

Khu vực `/auth` dùng Email/Password Supabase Auth; DEMO ở `/` giữ persona và ca/chat local. Không ghi tài khoản thật vào DEMO store hoặc localStorage. OTP/Magic Link, payment, lifecycle và Admin Dashboard ngoài phạm vi.

## Cấu hình môi trường test

Auth mặc định tắt. Chỉ sau khi có phê duyệt riêng cho project database test, điền `SELLTIME_AUTH_ENABLED=true`, `SELLTIME_AUTH_SUPABASE_URL`, `SELLTIME_AUTH_SUPABASE_ANON_KEY`, `SELLTIME_AUTH_ORIGIN`. Không dùng các credential `NEXT_PUBLIC_SUPABASE_*` cũ hoặc service-role key. Origin phải chính xác; HTTPS bắt buộc trên production, localhost HTTP chỉ dùng development. Mutation cần header Origin trùng cấu hình kể cả khi dùng Bearer token.

Review migration `src/database/migrations/006_auth_ownership.sql` cùng schema trước khi áp dụng thủ công trên database test đã xác minh. Không chạy file schema seed DEMO trên database production. Migration không liên kết tài khoản seed theo email: `auth_user_id` của seed vẫn NULL. Tài khoản Auth tạo trước migration cần được quản trị tin cậy cấp binding UUID và hồ sơ Candidate riêng; không tự ghép với DEMO. Migration thay thế các policy hiện có trên những bảng được bảo vệ, nên cần review ảnh hưởng trước khi áp dụng.

Signup luôn tạo Candidate bằng trigger, bỏ qua role metadata. Hồ sơ role được đọc mới mỗi request sau `auth.getUser`; không đọc role từ JWT metadata hoặc trình duyệt. Các lỗi cấu hình/provider/database fail-closed, không fallback SQL Server/memory. Session trả về danh tính, không trả token; cookies HttpOnly, SameSite Strict, Secure trên production. Refresh token ở cookie riêng và chỉ refresh sau kiểm tra Origin. Không log password/token. Logout kết thúc session local ở provider và xóa cookies; access JWT có thể còn hiệu lực đến expiry, vì vậy chọn TTL ngắn phù hợp ở môi trường test.

## Admin và quyền Employer

Admin đầu tiên chỉ được cấp bằng SQL quản trị tin cậy ngoài ứng dụng trên Auth UUID đã xác minh: cập nhật role của đúng hàng `users` có `auth_user_id` tương ứng. Không có API tạo Admin, đăng ký Employer hoặc sửa role trực tiếp. Không đưa khóa quản trị vào app.

`POST /api/auth/employer` nhận `{ "user_id": "UUID hồ sơ", "enabled": true }` hoặc `false`, chỉ session Admin đã xác minh mới gọi được RPC `set_employer_role`. RPC kiểm tra lại Admin trong database, chỉ thay Candidate/Employer, không thay Admin/DEMO. Request tiếp theo của mục tiêu đọc quyền mới ngay. API này không tạo employer profile hoặc cấp quyền tài chính.

`GET /api/auth/session`, `POST /api/auth/signup`, `login`, `logout`, `refresh` là các thao tác tài khoản. API shifts chỉ đọc ca sở hữu/ca đã ứng tuyển theo RLS; Employer tạo ca bằng INSERT, không upsert, server gán owner. ID trùng trả 409. API messages yêu cầu hội thoại tồn tại và thành viên; server gán sender, giới hạn 2000 ký tự, lấy tối đa 150 tin mới nhất. DELETE cần `conversation_id` và `message_id`, chỉ xóa tin của chính sender; không có reset hội thoại. Hội thoại/ứng tuyển chưa có flow tạo mới trong iteration này và chỉ được provision bằng quản trị test tin cậy.

RLS khóa đọc/ghi hồ sơ người khác, DEMO không binding, application riêng, membership chat; không cấp cập nhật lifecycle. Các cột role/Auth UUID/KYC/trust/escrow/PIN không được client sửa. Escrow transactions bị khóa cả đọc và ghi. Admin RPC có quyền đặc biệt duy nhất để đổi Candidate/Employer.

## Kiểm thử và hạn chế

Logout với Origin hợp lệ luôn dọn cả hai cookie khi session thiếu/hết hạn/không hợp lệ hoặc provider lỗi. Lỗi provider vẫn được trả về để phân biệt việc dọn cookie cục bộ với việc thu hồi session ở Supabase; không bảo đảm JWT đã phát hành mất hiệu lực trước expiry. Request sai Origin bị từ chối trước khi dọn cookie.

Policy INSERT shifts kiểm tra cả `employer_id`, role và tên/avatar khớp hồ sơ `users` liên kết Auth. Client không được gửi tên/avatar khác hồ sơ qua request trực tiếp tới Supabase; null/chuỗi rỗng đều biểu diễn avatar chưa thiết lập. Dữ liệu hiển thị là snapshot hồ sơ khi tạo ca, không phải chứng nhận pháp lý hay tên duy nhất toàn hệ thống.

Chạy `node src/__tests__/auth-ownership.test.mjs` để kiểm tra server/API bằng provider và database giả lập trong process; không gọi Supabase hay credential. Chạy tsc, regression và build theo spec. `src/database/tests/006_auth_ownership.sql` là bộ integration transaction rollback, chỉ chạy sau phê duyệt riêng trên database test đã xác minh và áp dụng migration. Nó tạo fixture Auth trong transaction, kiểm tra Candidate mặc định, RLS hai tài khoản, quyền Admin/Employer, chống spoof và khóa tài chính.

Trong lần triển khai này không truy cập database hoặc provider, không áp dụng migration, không deploy/live seed. RLS integration, email delivery, rate limit của provider và trình duyệt với cookies HTTPS chưa được xác minh thực tế. Cần kiểm chứng các bước đó trên môi trường test được duyệt trước khi bật Auth. Build không xác minh SQL/RLS.
