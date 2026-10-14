# Kế hoạch kiểm tra RLS migration 006

Trạng thái: **READY_FOR_DB_APPROVAL**. SQL: **NOT_RUN**. Đây là chuẩn bị offline; chưa nghiệm thu Auth hoặc chứng minh RLS hoạt động. Không tạo/truy cập database, dùng credential, cài công cụ hay deploy trong bước này.

## Dependency và điều kiện môi trường

- Chỉ dùng project Supabase test thật, riêng biệt, disposable, đã được chủ project duyệt bằng project ref cụ thể. Không dùng production hoặc database có dữ liệu ứng dụng.
- Supabase phải cung cấp `auth.users`, `auth.uid()`, `auth.identities` nếu có, và các role `anon`, `authenticated`. Không thay Auth bằng mock. Suite giả lập claim của phiên tại SQL bằng `request.jwt.claim.sub`, không kiểm tra đăng nhập/JWT qua HTTP, UI hoặc API.
- Schema gốc có **7 enum** (`user_role`, `work_type`, `shift_period`, `shift_status`, `application_status`, `escrow_type`, `escrow_status`), 6 bảng và 4 index. Bootstrap giữ nguyên toàn bộ DDL trước section 10, gồm `uuid-ossp`, defaults và constraints; bỏ toàn bộ INSERT seed.
- `000_test_baseline.sql` yêu cầu chưa tồn tại cả 8 bảng SellTime và 7 enum trong `public`, kể cả bảng rỗng. Dùng `public, extensions` cho search path để resolve `uuid_generate_v4()` nếu extension có sẵn trong `extensions`. Migration cần `gen_random_uuid()` trong Supabase thật.
- Migration 006 bổ sung `auth_user_id`, conversations/messages/index, trigger trên `auth.users`, các SECURITY DEFINER functions, RLS, policies và grants. Các hàm đặt search path rỗng và dùng tên schema đầy đủ. Migration được giữ nguyên; không chạy trong task này.

## Quyền bootstrap và quyền đang kiểm tra

Người vận hành được duyệt cần quyền tạo extension/type/table/index/function/trigger, quản lý grants/policies và trigger trên `auth.users`; quyền INSERT fixture Auth, UPDATE role ứng dụng và đọc đầy đủ fixture khi preflight/hậu kiểm. Suite bắt đầu bằng phiên đặc quyền, rồi `SET LOCAL ROLE authenticated` hoặc `anon` để kiểm tra quyền thực tế. Role `authenticated` phải không SUPERUSER và không BYPASSRLS; suite dừng nếu vi phạm. Phiên đặc quyền cần quyền SET ROLE tương ứng. Không chạy suite toàn bộ bằng service-role claim hoặc role bỏ qua RLS rồi tuyên bố đã kiểm tra RLS.

## Fixture matrix và assertion

| Fixture | Mục đích |
| --- | --- |
| UUID `00000000-0000-4000-8000-000000000601` / A | Signup Candidate dù metadata ADMIN; profile riêng; ứng tuyển ca B; Admin cấp/thu hồi Employer |
| UUID `00000000-0000-4000-8000-000000000602` / B | Signup Candidate dù metadata EMPLOYER; provision Employer bởi phiên đặc quyền; ca riêng và ca đã được A ứng tuyển |
| UUID `00000000-0000-4000-8000-000000000603` / Admin | Signup Candidate rồi provision Admin đặc quyền; ứng tuyển riêng; RPC cấp quyền |
| UUID `00000000-0000-4000-8000-000000000604` / app ID `auth006-mapped-user` | Signup qua trigger Auth thật, provision tin cậy gỡ/tạo lại FK profile để đổi app ID; kiểm tra binding, ownership, đọc/UPDATE profile và INSERT ca theo app ID |
| `auth006-demo` | Dữ liệu DEMO không liên kết Auth; RPC phải từ chối |
| Employer profiles của A/B | UPDATE thật thành công khi là Employer; Candidate/cross-owner bị chặn; KYC/PIN/badge/balance bị bảo vệ |
| `auth006-chat`, `auth006-private`, messages | Member đọc/gửi/xóa tin mình; không đọc/gửi hội thoại riêng; không xóa tin người khác; spoof sender/name/avatar bị chặn |
| `auth006-private-shift` / application Admin | A không thấy ca/ứng tuyển riêng; B đọc ca của mình và application liên quan |
| `auth006-applied-shift` / application A | A đọc đúng 1 ca đã ứng tuyển và đúng 1 application, không lộ ca khác |
| `auth006-financial` / `auth006-code` | Có ledger thật; authenticated không được SELECT/INSERT/UPDATE/DELETE |

Mọi fixture dùng namespace `auth006-` hoặc bốn UUID cố định trên. Signup assertion ban đầu yêu cầu đúng 3 row; fixture mapping thứ tư được thêm sau các tests visibility ban đầu. Positive UPDATE yêu cầu `ROW_COUNT = 1` và đọc lại đúng 1 row có giá trị mong đợi. Cross-owner UPDATE yêu cầu 0 row và phiên đặc quyền xác nhận row mục tiêu vẫn tồn tại, chưa đổi. Negative privilege cases chỉ bắt `insufficient_privilege`; lỗi khác dừng. Assertions đọc/xóa có row count và kiểm tra visibility từ member còn lại để tránh pass khi fixture chưa tồn tại. Tests ca riêng ban đầu được giữ nguyên; fixture ứng tuyển A được provision sau các assertions đó.

Các cases bổ sung kiểm tra sau revoke không UPDATE Employer profile hoặc INSERT ca; INSERT ca COMPLETED/filled_candidates=1 với danh tính B đúng để không bị spoof guard che lỗi; authenticated không được ghi lifecycle application/shift/conversation hoặc UPDATE message; anon không đọc các bảng hoặc gọi helper đã bị revoke. Đây là ý định của các SQL statements cần manual review và thực thi sau phê duyệt, chưa phải kết quả coverage thực tế.

## Thứ tự chạy sau phê duyệt riêng

Đề xuất dùng **psql** trong bộ binary ZIP từ [trang Windows chính thức của PostgreSQL](https://www.postgresql.org/download/windows/), phiên bản tương thích database test đã xác nhận, sau khi duyệt công cụ. Giải nén vào thư mục user được phép, giữ DLL đi kèm, không chạy PostgreSQL server/service hoặc thay PATH toàn hệ thống. Task này không tải/cài công cụ. Tham khảo [psql và ON_ERROR_STOP](https://www.postgresql.org/docs/current/app-psql.html). Chạy từ thư mục repository bằng các phiên psql riêng:

```text
psql -X -W -v ON_ERROR_STOP=1 -f src/database/tests/000_test_baseline.sql
psql -X -W -v ON_ERROR_STOP=1 -f src/database/migrations/006_auth_ownership.sql
psql -X -W -v ON_ERROR_STOP=1 -f src/database/tests/006_auth_ownership.sql
psql -X -W -v ON_ERROR_STOP=1 -f src/database/tests/006_verify_rollback.sql
```

Đây là template chưa chạy; người vận hành cấu hình host/database/user/port/SSL theo project đã duyệt. Không đặt password/token/connection URL có credential trên command line, trong repository, log hoặc tài liệu. Dùng prompt password `-W`; tránh ghi lại prompt/secret. Không bật echo SQL chứa secret; không đưa credential vào lịch sử shell. Xác minh project ref, endpoint và TLS trước khi kết nối. `-X` tránh cấu hình psql cá nhân; `ON_ERROR_STOP=1` dừng khi lỗi. Không dùng `--single-transaction` hoặc transaction bao ngoài: bootstrap/migration/suite/hậu kiểm có BEGIN/COMMIT/ROLLBACK riêng.

Suite dùng `\ir 006_verify_rollback.sql` trước BEGIN để từ chối collision và sau ROLLBACK để xác nhận namespace sạch. Hook resolve tương đối theo thư mục file SQL. Hậu kiểm dùng `BEGIN READ ONLY`, `SET LOCAL row_security = off` và phiên đặc quyền để không bị RLS che residue: phiên chưa đủ quyền sẽ báo lỗi, không âm thầm trả về tập row bị lọc. Quét Auth UUID/email, mọi trường của 8 bảng SellTime và Auth identities nếu có. Collision dừng, không tự xóa dữ liệu. Namespace có thể xuất hiện trong trường text của dữ liệu khác: vẫn dừng để điều tra.

Nếu suite lỗi bất ngờ, `ON_ERROR_STOP` khiến psql dừng trước hook cuối. Phiên psql riêng thoát và PostgreSQL rollback transaction fixture chưa commit. Nếu chạy tương tác, phải `ROLLBACK` rồi đóng phiên lỗi. Luôn mở **phiên đặc quyền mới** chạy `006_verify_rollback.sql`; đừng dùng phiên đang aborted hoặc role authenticated để xác nhận cleanup. Lưu exit code và output assertions đã bỏ mọi secret. Nếu hậu kiểm lỗi, dừng và điều tra; không tự DROP/DELETE/reset database.

## Phạm vi approval còn cần

Approval phải nêu rõ project ref test, người vận hành/quyền kết nối, công cụ được phép dùng, bootstrap DDL, chạy migration 006, provision fixture Auth/Admin/Employer trong transaction, chạy suite và hậu kiểm cleanup. Việc thay đổi database hiện có hoặc dọn project test sau đó cần phạm vi cụ thể được duyệt; không suy ra quyền drop/reset. ROLLBACK chỉ hủy fixture suite, **không hủy bootstrap hoặc migration đã COMMIT**. Migration có thay đổi Auth trigger/policies/grants nên phải review trước khi chạy.

## Validation offline

```text
node scripts/verify-rls-preparation.cjs
```

Validator chỉ đọc file cục bộ, so sánh bootstrap DDL với schema nguồn và kiểm tra marker/cấu trúc/hooks tĩnh bằng substring. Không dùng shell, network, database hoặc credential. Marker có thể xuất hiện trong comment hoặc statement không chạy; PASS không chứng minh coverage executable. Cần manual review vị trí, thứ tự, role/claim và assertions trong SQL, sau đó thực thi trên Supabase thật khi được duyệt. Validator không phải SQL parser; PASS không chứng minh SQL syntax, runtime, extension/search path, privilege, Auth trigger compatibility hoặc RLS enforcement trên Supabase. Không chạy build/TypeScript vì không thay ứng dụng/migration. Kết thúc tại READY_FOR_DB_APPROVAL; Auth vẫn chưa được nghiệm thu.
