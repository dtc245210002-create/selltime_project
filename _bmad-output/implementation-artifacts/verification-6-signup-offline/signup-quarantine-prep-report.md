# Chuẩn bị quarantine signup offline — c2c_a73f / Iteration 6

STATE: SIGNUP_QUARANTINE_PREP_READY. Chỉ thiết kế/synthetic; mọi live gate còn BLOCKED.
Workspace selltime_project / e9c367fdc841. Scope duy nhất: public.st_auth_new_identity().

## Single-path verification contract

Candidate cố định: C:/Users/admin/AppData/Local/SellTimeAuthEvidencePrivate. Không tạo, stat, probe, đọc ACL hoặc liệt kê đường dẫn này trong lượt này. signup_quarantine_design.py chỉ nhận evidence giả, dùng PureWindowsPath/ntpath, không gọi filesystem hay connector. PASS mang tên SYNTHETIC_DESIGN_PASS, không phải chứng nhận quarantine thật.

Evidence tương lai phải được thu thập trong checkpoint riêng, gồm thời điểm/deployed connector identity, toàn bộ active canonical read roots từ cấu hình được phép và nguồn chứng minh, canonical candidate/ancestors, absence of reparse/junction, effective ACL theo allowlist human duyệt, cloud-sync/index/export exclusions. Không thể suy luận cloud exclusion chỉ từ AppData hoặc quyền riêng tư chỉ từ owner. Không đọc config có token để tìm roots. Quyền inheritance, nested groups, backup/index/cloud agents và race/swap sau preflight phải được xét; không tự chỉnh ACL hay endpoint.

Thiếu/malformed roots, canonical alias/traversal, candidate nằm trong root, hoặc evidence ACL/reparse/sync/freshness không được xác minh ⇒ STOP. Model không tự attest các boolean; không cấp quyền chạy collector. Source C2C path guards được ghi ở báo cáo trước chỉ hỗ trợ thiết kế, không chứng minh active roots. Nếu không có cách chứng minh nguồn root không chứa secret trong scope được duyệt, giữ ROOTS_UNKNOWN và xin checkpoint riêng, không probe raw directory.

## Private I/O và password prompt design

Mô hình có ba channel: stdout private, stderr private và console human-only. Không phân loại stderr theo regex để đưa một phần lên terminal; stderr lỗi có thể chứa source/literals. Kênh public chỉ nhận token prompt allowlisted LOCAL_PASSWORD_PROMPT_REQUIRED và metadata, không có password field. Code không đọc stdin human, clipboard, env credential hoặc console thật. Tất cả fake process dùng fixed synthetic producer đã nghiệm thu; không gọi psql.

Upstream PostgreSQL REL_17_STABLE src/common/sprompt.c dùng CONIN$/CONOUT$ trên Windows, có fallback stdin/stderr nếu không mở được console hoặc môi trường MSYS. Điều này là source evidence, chưa chứng minh binary psql 17.11 đang dùng sẽ giữ prompt tách riêng khi redirected I/O. [Nguồn PostgreSQL chính thức](https://raw.githubusercontent.com/postgres/postgres/REL_17_STABLE/src/common/sprompt.c). -W yêu cầu prompt, -X bỏ startup files; các cờ không tự chứng minh privacy. [Tài liệu psql](https://www.postgresql.org/docs/17/app-psql.html).

Future adapter phải HALT trước connection nếu console chưa được chứng minh, echo chưa verified hoặc fallback có thể xảy ra; không thay bằng PGPASSWORD, password file/arg/stdin injection. User nhập password trực tiếp vào console riêng. Không thể coi prompt token test là interactive password test. Chưa triển khai adapter psql thật hoặc chứng nhận Windows terminal/echo; đây là blocker.

## Signup derivative và fingerprint

signup-quarantine-derivative-disabled.sql là bản riêng, giữ \set private_collection_authorized false trong file. Không bật bằng -v, không toggle thủ công, không dùng wrapper metadata có log public. Chỉ named zero-argument public.st_auth_new_identity(), OID17846, owner postgres, SECURITY DEFINER, trigger return, volatility v, empty search_path, body fingerprint 5f763cd39b9b47c3219d37daaef72c96; đúng enabled auth.users signup trigger binding và cardinality. Các điều kiện từ evidence metadata cũ, không truy vấn mới.

Signup language và full-definition hash vẫn UNKNOWN; body MD5 không chứng minh toàn bộ identity/source contract. ACL/dependency/full-definition continuity và concurrent-DDL semantics chưa chứng minh. Acquisition không được phép nếu executable derivative còn cần guard bỏ qua hoặc fingerprint chưa được review. Các hash SQL/collector/design/tests được lưu signup-quarantine-prep-hashes.json; hash file hoặc manifest không phải human authorization. Không sửa draft khác/function khác/006/007.

## Test matrix và giới hạn bằng chứng

test_signup_quarantine_design.py: 11 tests PASS, exit0, có subcases cho unknown canonical/roots/ACL/reparse/sync/freshness; malformed roots; ancestor containment và sibling boundary; alias/traversal; cấm evidence live; prompt console/echo/fallback UNKNOWN; reject private text vào public prompt; SQL/collector mismatch; thiếu hard-disabled gate.

Một test chạy bảy fake subprocess cases bằng collector đã nghiệm thu: stdout/stderr riêng, exit0/2/3, partial, overflow hai stream, timeout và dual pressure; giữ đúng saved native exit và giới hạn8192byte, pumps dừng, raw_acquired/released=false. Bằng chứng bổ sung reuse 26-case fault/CreateNew/cleanup suite đã nghiệm thu ở checkpoint trước; core collector không đổi hash. Fake outputs trong workspace rõ ràng chỉ synthetic, không phải quarantine private.

Đã kiểm thử path/prompt decision model và subprocess streams thật. CHƯA kiểm thử ACL/cloud/canonical candidate thật, connector roots live, psql console/password, SQL PostgreSQL hoặc raw sanitization. Các marker chỉ nằm trong mock evidence; không probe private candidate qua connector.

Review Blind Hunter: sáu finding được xác minh/patch và ghi triage trong spec-6-signup-quarantine-prep.md. Kết quả cuối 17/17 tests PASS, exit0. Added tests từ chối truthy synthetic flag, Windows malformed/device/control/trailing paths, connector root nằm bên trong candidate, comment false gate rồi active true, malformed containers và bytes drift đối chiếu pinned hashes. SQL disabled check là kiểm tra draft envelope, không phải SQL parser hoặc proof collector live. Các hash SQL và collector core không đổi; chỉ model/tests mới được cập nhật.

## Blockers và checklist human

1. ROOTS_UNKNOWN/QUARANTINE_UNVERIFIED: cần checkpoint thu thập read-only metadata đúng candidate và nguồn active read roots không chứa secret; hiện chưa xin thực thi.
2. CONSOLE_UNVERIFIED: cần adapter I/O được review và proof console bằng phương thức riêng được duyệt; không chạy psql ở checkpoint hiện tại.
3. SIGNUP_FINGERPRINT_INCOMPLETE: language/full definition chưa biết; xác định cách acquisition fail-closed, không tự đọc metadata bổ sung.
4. EXECUTION_DISABLED: human phê duyệt độc lập đúng ONE signup acquisition sau khi các blocker trên giải quyết, với exact project/script/collector hashes và destination human-only; không gộp helpers/policies.
5. RELEASE_NOT_APPROVED: human sanitizes privately và phê duyệt derivative/destination riêng trước khi Codex/ChatGPT đọc. Không copy raw vào C2C/workspace.

Tất cả checkpoint database/F-policy/migration/fixture/repair/deploy/LIVE vẫn bị khóa. Approach A, giữ SET NULL, cấm Auth hard-delete. HEAD/index/user work giữ nguyên; không commit. Dừng và gửi ChatGPT review.

## Quyết định review đã nhận

OFFLINE_DESIGN: ACCEPTED; SYNTHETIC_TESTS: 17/17 PASS; LIVE_ACQUISITION: BLOCKED. ChatGPT đã kiểm tra artifact qua đúng connector, không chạy lại tests.

Next: PREPARE_QUARANTINE_ENVIRONMENT_REQUEST — chỉ chuẩn bị offline execution request cho một candidate path, với exact tool/command allowlist, canonical/ancestor/reparse/ACL/cloud/root evidence, sanitized contract và STOP gates; sau đó human approval riêng. Chưa được probe/create quarantine, đọc config có token, thay ACL/connector, chạy psql/SQL hoặc đọc definitions. Console proof và ONE signup acquisition là hai checkpoint độc lập sau đó. Lượt hiện tại STOP tại SIGNUP_QUARANTINE_PREP_READY.
