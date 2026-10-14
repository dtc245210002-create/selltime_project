# Báo cáo collector offline — c2c_a73f / Iteration 6

STATE: PRIVATE_COLLECTOR_OFFLINE_READY (chỉ synthetic; chưa sẵn sàng live).
Workspace selltime_project / e9c367fdc841. Chỉ chuẩn bị cho public.st_auth_new_identity(), không thu thập definition.

## Thiết kế và triển khai

private_collector_offline.py là implementation thật của collector thử nghiệm, không còn chỉ giả lập exit. Nó chỉ chạy subprocess producer synthetic cố định bằng Python hiện có; không nhận executable/SQL tùy ý và không có psql, network hay password path. Output được đọc đồng thời qua hai pipe, queue bounded, lưu hai file riêng bằng CreateNew. Giới hạn tổng hai stream tối đa 65.536 byte; overflow/timeout dừng producer, giữ phần đã ghi và native exit thực tế. Gate failure trước launch không giả tạo native exit. Native exit lưu trước status; report failure không thay exit. Không retry, tự release hoặc in stream/exception ra public.

Caller phải qua offline, approval/quarantine mock, đúng hash và đúng mock root. Đây là các gate synthetic, không phải chứng nhận human approval hoặc quarantine thật. Mock root nằm trong workspace/OneDrive, rõ ràng KHÔNG phải nơi chứa raw thật. CLI chỉ là producer synthetic. Collector không dùng password; chưa chứng minh interactive psql password với stdout/stderr private. Không sửa các SQL/hash đã được review.

## Kiểm thử thực tế

Lệnh Python hiện có chạy test_private_collector_offline.py, exit 0; 14/14 PASS. Producer/process/pipe/file là thật, dữ liệu hoàn toàn synthetic.

| Trường hợp | Kết quả |
|---|---|
| Stdout/stderr isolation | Hai marker chỉ vào hai file tương ứng; không ra stdout/stderr của collector hoặc public JSON |
| Native auth/SQL mock | Giữ chính xác 2/3 trong return và native.exit.txt |
| Partial output | Native 3 vẫn giữ cả hai phần output |
| Overflow stdout/stderr | OUTPUT_OVERFLOW; tổng file tối đa 8192 byte trong test; lưu exit thực tế sau terminate, không gán 2/3 giả |
| Timeout | TIMEOUT; giữ output đã nhận và exit thực tế |
| Report failure | Native 3 đã lưu; không có status thành công giả |
| CreateNew collision | Từ chối trước launch, giữ nguyên marker file có sẵn |
| Thiếu approval/quarantine | Chặn trước launch |
| Hash mismatch | Chặn trước launch |
| Live hoặc sai root | Chặn trước launch |
| Limit quá lớn | Từ chối cấu hình |

Bằng chứng: private-collector-test-results.json và collector-synthetic-runs/* chứa synthetic bytes, native.exit.txt/status. Không có definition thật. Test chưa chứng minh SQL syntax, psql I/O, private stderr của database, ACL thật, connector exclusion hoặc sanitizer.

Review Blind Hunter phát hiện sáu nhóm lỗi/gap; đã triage và patch, không đổi scope. Lần kiểm thử cuối 26/26 PASS, exit 0: bổ sung read/write/flush/close faults, source/mkdir/process launch, native/status persistence, pressure đồng thời hai pipe, exact/above aggregate limit. Pump enqueue có cancellation và bounded shutdown. Khi không thể ghi native.exit.txt, collector trả native exit thực tế cho caller, đánh dấu native_exit_saved=false và NATIVE_EXIT_SAVE_FAILED; không thể cam kết file tồn tại khi disk lỗi. Test thread shutdown/timeout giới hạn 5 giây; các kết quả này vẫn chỉ dùng nguồn synthetic. Chi tiết triage nằm trong spec-6-private-collector-offline.md.

## Báo cáo xác minh quarantine

Mock path kiểm tra lstat các ancestor, từ chối symlink/reparse point và root sai. Không scan thư mục cá nhân. Không sửa ACL/connector. Quarantine private đề xuất ở AppData/Local vẫn CHƯA tạo, CHƯA xác minh ACL, cloud-sync/indexing hoặc khả năng đọc qua connector.

Investigation read-only C2C source: C:/Users/admin/codex-with-chatgpt/src/workspace/manager.ts có Workspace canonicalize root (:91), contains (:109), canonicalize ancestor (:119), resolve chống canonical escape (:139), readFile gọi resolve (:190). src/mcp/server.ts (:284/:342) và src/workspace/search.ts (:202) dùng guard workspace. tests/workspace.test.ts (:59/:77/:87) có external/symlink tests, có thể skip do privilege. Đây là source evidence, không chứng nhận deployed revision/config, active roots, race resistance hoặc junction behavior. Không đọc state/token/credential.

Gate trước live phải kiểm tra đúng một candidate path đã duyệt: absolute/canonical ancestors không reparse, ngoài tất cả active connector read roots, Windows ACL không mở cho principal ngoài allowlist được duyệt, không cloud sync/export và endpoint/chứng thư đúng. Kết quả không biết ⇒ HALT. Không tự điều chỉnh ACL/connector để làm PASS. Không dùng source guard hoặc cờ boolean làm bằng chứng cách ly thực tế. Kiểm chứng connector bằng synthetic marker chỉ được thực hiện dưới một phạm vi phê duyệt riêng; không thử đọc raw quarantine.

## Blockers và yêu cầu riêng cho ONE signup acquisition

Chưa đề nghị thực thi ngay. Điều kiện còn thiếu: quarantine thật được chứng minh; collector psql private được review/test synthetic; password prompt được giữ local mà raw stdout/stderr không bị capture; giới hạn/timeout/cleanup khi disk/thread/process lỗi được review; signup language/full-definition fingerprint chưa biết; executable SQL derivative còn khóa.

Sau khi đủ điều kiện, request riêng phải ghi chính xác project dauglhucpflemfdsygzr, public.st_auth_new_identity() duy nhất, script/collector SHA256, fingerprint/binding gates, private destination đã xác minh, human-only raw recipient, đúng một attempt và STOP. Không gộp ba helper, F-policy hoặc migration. Thất bại không retry. Sau collection, human kiểm tra/sanitize riêng và phê duyệt release bản derivative riêng cho Codex/ChatGPT; không tự copy raw vào workspace.

Approach A; giữ SET NULL, cấm Auth hard-delete. Không có DB query, credential, fixture, migration, source SellTime edit hoặc Git mutation. HEAD 96f4be8575718d50eab2285ab5241d1583f3423a và index SHA256 2CCEC39D9D69A39044F41840197966E9D329EC3DEF5935BF7372CE342253888A giữ nguyên. TypeScript/regression/build ứng dụng không chạy vì chỉ thay tool evidence offline; không thay dependencies app. STOP để ChatGPT review.

## Quyết định ChatGPT đã nhận

OFFLINE_COLLECTOR: ACCEPTED; SYNTHETIC_TESTS: 26/26 PASS; LIVE_ACQUISITION: BLOCKED. ChatGPT đã đọc code/tests/evidence qua đúng connector, không chạy lại tests.

Q1 quarantine thật chưa xác minh; Q2 private I/O/password prompt của psql chưa kiểm thử; Q3 chưa có signup executable derivative được review, language/full-definition fingerprint chưa biết. Bước tiếp theo PREPARE_SIGNUP_QUARANTINE_VERIFICATION: thiết kế single-path read-only checks và STOP evidence, fake-process psql I/O tests, signup derivative design vẫn khóa, checklist human riêng. Không được tạo private directory, chỉnh ACL/connector, probe private path qua connector, chạy PostgreSQL hoặc thu thập definitions. Lượt hiện tại STOP sau khi ghi quyết định review.
