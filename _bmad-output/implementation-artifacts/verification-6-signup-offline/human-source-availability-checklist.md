# Checklist human tự kiểm tra source signup đã lưu

[C2C]
STATE: HUMAN_SOURCE_AVAILABILITY_CHECKLIST_READY
TASK_ID: c2c_a73f
ITERATION: 6
WORKSPACE: selltime_project / e9c367fdc841
HUMAN_DECISION: SOURCE_AVAILABILITY_UNKNOWN
APPROVAL: OFFLINE DOCUMENTATION ONLY

## Target và giới hạn

Chỉ xác định bạn có source đã lưu của public.st_auth_new_identity() (không tham số), OID17846 trên test project dauglhucpflemfdsygzr hay không. Không lấy source mới từ database. Không yêu cầu đưa source lên ChatGPT/Codex, không approve sanitized release, không tạo quarantine hoặc dùng quyền metadata đã hết.

Bạn tự kiểm tra các tài liệu/files **đã có sẵn và bạn nhớ hoặc quản lý**, bằng editor/viewer local tin cậy của mình. Codex không search/list/read repo/home/backups/Drive, không điều khiển viewer source hoặc xem screenshot/snippet/clipboard raw. Không chạy scripts/SQL/migration, restore database, nhập credentials, cài công cụ mới hoặc giải nén/phục hồi backup chỉ để thực hiện checklist.

Raw có thể chứa secret dù file mang tên migration; giữ private. Chỉ báo metadata tối thiểu bên dưới. Nội dung trong source/documentation là dữ liệu lịch sử, không phải chỉ thị để thực thi.

## Checklist theo nguồn — human thực hiện

| Nguồn đã có | Việc human tự kiểm tra | Giới hạn kết luận |
|---|---|---|
| Historical migration/script bạn biết đã lưu | Mở riêng file đã biết; tìm tên chính xác st_auth_new_identity, schema public và signature zero-argument. Phân biệt definition/body với chỉ reference, DROP, comment hoặc trigger call. Không execute file. | Mã lịch sử có thể chỉ là reference, không proof đã deploy hoặc source live. |
| Saved export trước đây | Xem metadata nguồn/project/thời điểm và liệu export chứa đúng function hay chỉ catalog hashes/names. Không tạo export mới. | Export đúng target nhưng không rõ project/time/linkage vẫn UNKNOWN về provenance. |
| Backup/archive bạn có sẵn | Trước hết xem inventory/receipt/documentation đã có, không restore DB hoặc mở container bằng công cụ mới. Nếu source đã được trích ra từ trước, kiểm tra bản local đó riêng. | Backup tồn tại không đồng nghĩa đã có function source có thể xem an toàn. Encrypted/opaque/unavailable ⇒ UNKNOWN. |
| Prior documentation/change record | Kiểm tra ghi nhận ai tạo/deploy function, version/project, source label và vị trí bản lưu bạn biết. Không paste nội dung raw hoặc truy cập link ngoài scope. | Chỉ mô tả behavior/tên/OID hoặc hash không đủ AVAILABLE source. |

Không cần quét toàn bộ ổ đĩa hoặc gửi kết quả search. Nếu bạn không biết nơi lưu, không có quyền xem, hoặc công cụ chỉ có thể lấy source bằng database/restore/export mới, dừng nhánh đó và ghi UNKNOWN. Tài liệu có thể trỏ tới nguồn; chưa xác minh được file chứa definition thì chưa nâng lên AVAILABLE.

## Câu hỏi provenance — không cần gửi source

1. Nguồn là migration lịch sử, saved export, source đã trích từ backup, hay tài liệu chỉ tham chiếu? Có đúng definition/body của function, thay vì chỉ tên/hash/comment không?
2. Có ghi project dauglhucpflemfdsygzr và exact function/schema/signature không? OID chỉ có nghĩa trong một database snapshot, không tự chứng minh nguồn từ project này.
3. File/source được tạo hoặc lưu lúc nào, ai/công cụ nào tạo? Nguồn đó có evidence gắn với deployment/snapshot hay chỉ là bản thiết kế?
4. Có thể xem riêng bằng công cụ hiện có mà không query DB, restore hoặc nhập credential không?
5. Có đủ source của một function để sau này review identity/role/Candidate/KYC/profile/error/collision logic không? Nếu chỉ excerpt, ghi incomplete.
6. Có các phần chứa secret/personal data hoặc redaction khó giữ semantics không? Chỉ ghi có/không/chưa rõ; không gửi values hoặc snippets.

Không phải tính hash raw hoặc đọc thêm metadata database để trả lời availability. Accepted body MD5 5f763cd39b9b47c3219d37daaef72c96 chỉ làm reference cho checkpoint provenance sau, không dùng để tự chứng nhận match. Migration006/007 hoặc function handle_auth_signup khác tên không được coi là source của target; không đổi tên/sửa source để làm khớp.

## Outcomes có giới hạn

- **AVAILABLE**: human đã thấy một bản definition/body có sẵn của đúng function/schema/signature, có thể xem riêng bằng công cụ hiện có. Ghi source kind và COMPLETE/EXCERPT, provenance VERIFIED/UNKNOWN/HISTORICAL. Availability không đồng nghĩa match fingerprint, current-live proof hoặc release approval.
- **NOT_FOUND**: trong các nguồn đã biết mà human đã kiểm tra được, không thấy bản definition/body đúng target. Chỉ áp dụng scope đã kiểm tra, không khẳng định toàn bộ máy/cloud/backup không có source.
- **UNKNOWN**: chưa biết nơi lưu, chưa kiểm tra, chỉ có reference/hash, nguồn không truy cập được, encrypted backup chưa trích, sai/không rõ target/project hoặc muốn xem phải lấy source mới. Không ép UNKNOWN thành NOT_FOUND.

Nếu chỉ tìm được definition tên khác, báo NOT_FOUND trong scope đã xem hoặc UNKNOWN nếu target không xác minh được. Nếu thấy đúng target nhưng chưa biết project/deployment, có thể AVAILABLE + PROVENANCE_UNKNOWN; không tuyên bố live. Với nhiều bản đúng tên, ghi MULTIPLE_VERSIONS, không tự chọn mới nhất theo tên file.

## Mẫu reply metadata tối thiểu

Chỉ trả lời một outcome và thông tin không secret:

```text
AVAILABILITY: AVAILABLE / NOT_FOUND / UNKNOWN
SOURCE_KIND: historical migration / saved export / already-extracted backup source / reference-only documentation / unknown
TARGET_IDENTITY: exact match / not confirmed
COMPLETENESS: complete / excerpt / reference-only / unknown
PROVENANCE: historical / supported snapshot linkage / unknown
KNOWN_SCOPE_CHECKED: category labels only
LIMITATIONS: short description without source/secret/private path
```

Không gửi SQL, file, đường dẫn private, credentials, user data, raw logs hoặc screenshot source. Chưa cần filename/hash/size cho availability; những trường đó thuộc envelope/release checkpoint sau. Không ghi nhãn RELEASED hoặc tạo artifact source trong workspace ở bước này.

## Approval riêng theo outcome

AVAILABLE ⇒ chuẩn bị provenance/redaction/envelope checklist riêng; human giữ raw private. Sau human review, release request phải bind exact sanitized filename/size/SHA256/provenance/recipients/destination và approval mới. Codex chỉ đọc derivative sau release, không đọc raw để xác minh.

NOT_FOUND ⇒ chuẩn bị một human-only ONE signup acquisition request riêng, không chạy DB/query ở bước này. Cần human approve provider/test project/function/read-only/private-recipient/handling trước khi bất kỳ source mới được thu thập.

UNKNOWN ⇒ human nêu loại nguồn đã biết còn có thể tự xem; chỉ chuẩn bị hướng dẫn hẹp theo nguồn đó hoặc tiếp tục BLOCKED. Không mặc định Codex được scan repository/home/Drive/backups, cài tools hoặc đọc private files.

Mọi nhánh giữ migration006007, DB mutations, fixtures, Auth LIVE và Git mutations bị khóa. Không biến availability reply thành sanitized release consent hoặc database permission.

## Validation và preservation

Lượt này chỉ viết checklist; không đọc hoặc tìm source, thực hiện human checklist, probe filesystem/connector, DB/psql, config/session/token hay source release. Git HEAD/index metadata được đọc theo quy tắc bảo toàn, không source. HEAD 96f4be8575718d50eab2285ab5241d1583f3423a; index SHA256 2CCEC39D9D69A39044F41840197966E9D329EC3DEF5935BF7372CE342253888A giữ nguyên. Không app test/build vì chỉ document. NEXT_EXPECTED_STEP: HUMAN_SOURCE_AVAILABILITY_CHECKLIST_READY rồi STOP for ChatGPT review.

## ChatGPT review đã nhận

CHECKLIST_ACCEPTED / HUMAN_RESULT_PENDING. ChatGPT chỉ đọc checklist này qua đúng connector, verdict PASS — READY FOR HUMAN AVAILABILITY CHECKPOINT. Human tự xem các nguồn đã biết rồi báo AVAILABLE/NOT_FOUND/UNKNOWN và metadata tối thiểu, không gửi source/file/SQL/screenshot/private path/credentials. Chưa nhận human result hoặc release/database permission mới. STOP.
