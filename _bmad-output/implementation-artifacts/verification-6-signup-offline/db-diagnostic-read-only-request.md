[C2C]
STATE: DB_DIAGNOSTIC_READ_ONLY_REQUEST
TASK_ID: c2c_a73f
ITERATION: 6
WORKSPACE: selltime_project
WORKSPACE_ID: e9c367fdc841
TEST_PROJECT_REF: dauglhucpflemfdsygzr
STATUS: PREPARED OFFLINE — EXECUTION NOT APPROVED

## Checkpoint xin duyệt

Chỉ kết nối lại Supabase test bằng psql user-scope và chạy file `db-diagnostic-catalog.sql` cạnh tài liệu này. Session Pooler: aws-0-ap-northeast-1.pooler.supabase.com:5432; user postgres.dauglhucpflemfdsygzr; database postgres. Xác minh lại workspace, project connection, IPv4/TLS verify-full với CA C:/Users/admin/Downloads/prod-ca-2021.crt. Mật khẩu chỉ nhập cục bộ tại terminal, không đọc/persist/chia sẻ credential. Không chạy lại toàn bộ preflight cũ.

## Phạm vi và tiêu chí kết quả

- B1: inventory trigger không nội bộ trên auth.users và metadata/hash của function SellTime liên quan. Xác minh tên, enabled, function signature/owner, security definer, return type và empty search_path. Không dump function body, trigger arguments hoặc cấu hình function tùy ý. Không tự tạo trigger nếu thiếu.
- B2: đọc metadata default/email collation và pg_database locale/version. Xác định giá trị NULL thuộc default collation hay database metadata; đối chiếu tài liệu PostgreSQL trước kết luận. Không thay collation, refresh version hoặc sửa guard 007.
- B3: đọc thuộc tính FK/UNIQUE catalog và cột tham chiếu của public.users; xác minh binding trỏ auth.users(id), ON DELETE CASCADE (confdeltype=c), validated và nondeferrable. Index shape/opclass/collation và dependency object identity chỉ là metadata; chưa chứng minh mọi dependency an toàn.
- Ghi exact psql exit code riêng, phân biệt lỗi SQL với lỗi wrapper. Sửa/kiểm tra wrapper chỉ local/offline, cần review trước lần kết nối mới. Lỗi CommandNotFoundException hiện chưa xác định command gây lỗi; không suy luận psql exit 0 từ COMMIT.

SQL dự thảo chỉ có BEGIN READ ONLY, SET LOCAL, SELECT catalog và COMMIT; chưa parse/runtime verify trên PostgreSQL. Không đọc user rows/email thật, không DDL/DML, không fixture, signup provider, sửa quyền hoặc database repair. Giữ nguyên evidence cũ và dùng file output mới nếu được duyệt.

## Điều kiện STOP

Identity/endpoint/TLS/auth không khớp, thiếu quyền, SQL lỗi, schema/ACL/dependencies bất thường hoặc cần quyết định normalization mới: ghi evidence sanitized và STOP; không rerun tự động, không nới guard. Database metadata không độc lập chứng minh dashboard project identity. Không dump function source hoặc credential.

## Quyền không bao gồm

Migration 000/006/007, fixtures, user-row queries, DB mutations/cleanup/reset, credential changes, Git mutations, deploy và Auth LIVE. Checkpoint này không nghiệm thu Iteration 6 hoặc tự cấp quyền bước tiếp theo.

Human có thể phê duyệt: “Cho phép DB_DIAGNOSTIC_READ_ONLY trên project test dauglhucpflemfdsygzr, chỉ chạy db-diagnostic-catalog.sql sau review wrapper, với password entry local và TLS verify-full. Không cấp quyền sửa database hoặc migration.”

Preservation: HEAD 96f4be8575718d50eab2285ab5241d1583f3423a; index SHA256 2CCEC39D9D69A39044F41840197966E9D329EC3DEF5935BF7372CE342253888A không đổi. Chỉ tạo hai artifact offline.
NEXT_EXPECTED_STEP: STOP — human approval required before database access.
