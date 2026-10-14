[C2C]
STATE: DB_PREFLIGHT_APPROVAL_REQUEST
TASK_ID: c2c_a73f
ITERATION: 6
WORKSPACE: selltime_project / e9c367fdc841
STATUS: PREPARED ONLY — NOT RUN

Xin duyệt riêng connectivity/TLS và catalog preflight chỉ đọc cho Supabase test ref **dauglhucpflemfdsygzr**.

Connection đã được user cung cấp: Session pooler; host aws-0-ap-northeast-1.pooler.supabase.com; port 5432; user postgres.dauglhucpflemfdsygzr; database postgres. Không production hoặc project khác.

Tool hiện có: psql-preflight-6/bin/psql.exe trong runtime user-scope dưới C:/Users/admin/.codex/visualizations/2026/10/08/01a11a09-fccd-7663-b16b-9f776da40dc8/. Không cài server/service hoặc chạy Administrator.

TLS bắt buộc verify-full với CA public đã cung cấp C:/Users/admin/Downloads/prod-ca-2021.crt. Xác minh DNS/TCP IPv4/hostname/certificate trước queries. Không hạ xuống require/disable, không bỏ kiểm tra chứng chỉ. Mật khẩu nhập trực tiếp tại terminal Windows user bằng -W; không chat, không log/persist password/token, không dùng credential cũ. Psql -X, no client-certificate/GSS secret discovery, passfile missing và process-only env sạch theo flow preflight đã chuẩn bị; không đổi biến toàn hệ thống.

SQL reviewable: db-preflight-readonly.sql cạnh tài liệu này. BEGIN READ ONLY; statement/lock timeouts; SELECT catalog, roles, effective protected-column privileges, constraint/index/function hashes, dependency counts, TLS session và các Unicode literal fixtures. Không SELECT nội dung user/profile/email thật, không function-body dump. Không DDL/DML/temp tables/functions, migration, fixture mutation, cleanup, reset hoặc deploy. Schema chưa có trả inventory rỗng; không tự bootstrap. Lượt preflight này không kiểm tra data duplicate counts hoặc Auth email binding vì chưa cấp quyền đọc user rows; data preflight, nếu cần, sẽ xin scope riêng chỉ counts.

Giới hạn: server identity/project ref dựa trên endpoint/user và xác nhận project test đã được user cung cấp; catalog không tự chứng minh project ref. Chưa biết provider build/settings hoặc collation thực. SQL chưa được parse/execute ở PostgreSQL. Preflight PASS không phải migration/integration approval.

HALT nếu authentication/TLS/identity không khớp, quyền đọc thiếu, protected fields writable bất thường, schema/definitions/dependencies khác dự kiến hoặc normalization cần policy mới. Không tự đổi password, role/ACL, collation, guard hay sửa data để vượt lỗi. Report sanitized exit codes, catalog/privilege findings và blockers; STOP trước mọi DB mutation.

Decision xin human: cho phép **chỉ** connectivity/TLS và chạy script read-only nêu trên trên đúng test ref bằng password entry local. Mọi 000/006/007, SQL/provider integration, fixture/cleanup và LIVE vẫn NOT APPROVED.
