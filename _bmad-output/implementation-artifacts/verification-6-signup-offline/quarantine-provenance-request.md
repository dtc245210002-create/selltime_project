# Yêu cầu provenance quarantine — chuẩn bị offline

[C2C]
STATE: QUARANTINE_PROVENANCE_REQUEST_READY
TASK_ID: c2c_a73f
ITERATION: 6
WORKSPACE: selltime_project / e9c367fdc841
PROVISIONING_EXECUTION: NOT APPROVED
ENVIRONMENT_EXECUTION: NOT APPROVED

## Mục đích và scope

Giải quyết ROOTS_UNKNOWN/SYNC_UNKNOWN/ANCESTOR_VOLUME_UNVERIFIED mà không biến permission đọc metadata cũ thành quyền mới. Candidate cố định C:\Users\admin\AppData\Local\SellTimeAuthEvidencePrivate vẫn absent theo evidence đã nghiệm thu; không kiểm tra lại, tạo, xóa hoặc probe candidate trong lượt này. Chỉ viết request này. Không connector config/session/token reads, registry/home scan, credentials/user data, psql/DB/raw definitions hoặc Git mutation.

Thiếu provenance không phải lý do nới guard. Gói này là READY_FOR_REQUEST_REVIEW, không phải chứng nhận isolation hoặc authorization. Không cho rằng ACL current user ngăn tools/process khác cùng SID; connector containment chỉ giới hạn connector được xác minh, không cô lập toàn bộ Codex/native filesystem APIs.

## P1 — Secret-free roots provenance

Scope chỉ connector Codex with ChatGPT · selltime_project và bridge deployment phục vụ workspace ID e9c367fdc841. Không kiểm tra selltime-review hoặc workspace khác. Không yêu cầu dump session/state/config/OAuth, list environment variables, token metadata hoặc process command lines có thể chứa secret.

Nguồn chấp nhận cần một export metadata quản trị human kiểm soát hoặc báo cáo deployment được phép, có thể gắn với đúng bridge/session đang phục vụ connector. Tối thiểu gồm: identity deployment/build và phiên bản guard; timestamp UTC; workspace ID; danh sách đầy đủ canonical roots của connector này và phạm vi read/search/execution-output; các alias/mount/junction hoặc roots mở rộng bị vô hiệu; cơ chế containment/canonicalization, điều kiện cache/restart và cách chứng minh export tương ứng current process. Canonical roots liên quan được phép mới phát hành; metadata ngoài scope phải được human loại bỏ.

Chưa xác định được exporter chính thức đáp ứng đủ trường này. Không giả định c2c status/session/doctor là nguồn safe hoặc đầy đủ. Không chạy chúng để tìm dữ liệu. Có thể hỏi human/người vận hành cho đúng một nguồn attest được sanitize; source filename/command trước khi đọc cần checkpoint riêng và không được nằm trong credential-bearing files. Nguồn không có nguồn gốc, không gắn current deployment, thiếu root hoặc stale ⇒ ROOTS_UNKNOWN. RootAlias từ workspace_info và source code guard đã đọc chỉ là supporting evidence, không đủ chứng minh toàn bộ roots active.

Attestation human phải mô tả nguồn và giới hạn, không chỉ click xác nhận boolean PASS. Nếu có nguồn safe, một approval P1 riêng chỉ cho đọc đúng export đã sanitize, đối chiếu workspace ID/build/timestamp và overlap hai chiều với candidate; không probe connector path để suy luận roots. Không tự cài exporter/đổi bridge config vì điều đó là implementation/security scope mới.

## P2 — Sync / index / export / backup provenance

Human/người vận hành cung cấp metadata policy áp dụng cho đúng candidate/parent, thời điểm, nguồn quản trị, dịch vụ nằm trong scope và exclusion được enforce. Không đưa tenant/device ID, accounts, sync content, file lists hoặc secret vào chat. Không suy luận không sync chỉ vì AppData hoặc không có cloud attributes.

Phải xét cloud folder mappings, Windows search indexing và custom indexers, export/backup agents, redirect policies và các process cùng account. Không thể chứng minh vắng mọi agent bằng một folder attribute; nếu phạm vi policy không đầy đủ thì SYNC_UNKNOWN. Không scan registry/services/processes/home để tự hoàn thiện danh sách. Chỉ khi có source quản trị cụ thể được human duyệt, mới tạo một command/value allowlist read-only mới; trước đó không có lệnh P2 đủ điều kiện chạy.

Không yêu cầu disable sync/index/backup hoặc thay policy. Bất kỳ thay đổi nào cần approval riêng. Đánh giá phải ghi threat model và exclusions đã chứng minh, không hứa privacy khỏi administrator/SYSTEM/current-SID process.

## P3 — Ancestor / volume preflight proposal (READ ONLY tương lai)

Candidate chưa tồn tại nên P3 chỉ đọc parent/ancestors, không candidate. Chính xác năm literal paths: C:\, C:\Users, C:\Users\admin, C:\Users\admin\AppData, C:\Users\admin\AppData\Local. Scope mới khác attempt existence đã dùng; không dùng lại approval cũ.

Tool đề xuất: PowerShell user không elevated. `Get-Item -LiteralPath <một trong năm paths trên> -Force -ErrorAction Stop` để thu Container và flags reparse/offline/recall, không Target/contents, không wildcard/-Recurse. Reparse hoặc inaccessible ancestor ⇒ STOP trước resolve. Canonical parent resolution chỉ thực hiện sau attribute checks, dưới wrapper exact hash được review ở checkpoint riêng; không follow unknown links. Không tạo chain nếu parent thiếu.

Đề xuất volume metadata duy nhất: `Get-Volume -DriveLetter C -ErrorAction Stop | Select-Object FileSystemType,DriveType,HealthStatus` trong một approval read-only P3 riêng. Không list volume khác, mountpoints, serial/device identifiers hoặc filesystem contents. Field/cmdlet không khả dụng ⇒ UNKNOWN, không silently infer. [Get-Volume, Microsoft](https://learn.microsoft.com/en-us/powershell/module/storage/get-volume). Kết quả filesystem type hỗ trợ assessment, nhưng NTFS label không tự chứng minh persistent ACLs/effective access. Muốn xác nhận flag FILE_PERSISTENT_ACLS cần helper Win32 read-only đã review/mocked và exact hash; helper chưa triển khai/approved. [GetVolumeInformationW, Microsoft](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-getvolumeinformationw). Không gọi API bất kỳ trong lượt request này.

Owner/ACL proposal nếu human duyệt P3: Get-Acl đúng parent C:\Users\admin\AppData\Local, giữ trong memory, output chỉ owner-current và allowed/other/inheritance/uncertainty classes. Không sửa parent ACL. Quyền parent CreateDirectories/DeleteChild/ChangePermissions và group semantics cần effective-access đánh giá; raw DACL alone không đủ. ACL/grants không rõ ⇒ ANCESTOR_ACCESS_UNKNOWN. Không in SDDL/SIDs/account names, không mở subdirectories.

Tất cả command P3 ở đây là proposal, chưa runnable allowlist approval. Execution request P3 phải pin exact wrapper/hash, single attempt, timeout/error contract và metadata file mới trước human approval. Không chạy command hoặc parser compile có side effect để chứng minh parent trong lượt này.

## P4 — Race/path-swap và identity contract

Chuỗi Get-Item/resolve rồi CreateDirectoryW bằng pathname có TOCTOU. DACL-at-create chỉ giảm ACL window, không khóa ancestor identity. Recheck trước/sau phát hiện một số drift nhưng không chứng minh không swap rồi swap lại giữa checks. Nếu ancestor handle/file identity hoặc parent mutation threat chưa được giải quyết ⇒ RACE_UNRESOLVED.

Future wrapper cần design/review riêng cho binding đúng parent, canonical volume/file identity, không reparse, quyền sharing không cho rename/delete nếu cơ chế Windows hỗ trợ, giữ handles từ preflight đến create/postcheck và hành vi khi handle/API không đạt. Không tự khẳng định CreateDirectoryW trở thành relative-to-handle API; tên/path semantics vẫn phải được xét. Native handle/API design chưa implemented/runtime-tested; không enable privileges hoặc chỉnh ACL để khóa ancestors. Không thử race trên directory thật trong scope này.

Ngay cả handles đúng cũng không bảo vệ khỏi admin/kernel hoặc principal hiện tại có quyền cao. Threat model/human policy phải ghi rõ. Khi không chứng minh được contract với scope/quyền cho phép, STOP thay vì thêm ngoại lệ guard.

## Sanitized output và STOP contract

Mỗi packet độc lập ghi task/workspace, approval ID, source class, acquisition UTC, deployment provenance đã sanitize, scope-complete flag có supporting evidence, per-check result/UNKNOWN, limitations và reviewer verdict. Không ghi source raw; request không authorizes tự đọc/export nó. Evidence file mới CreateNew trong verification-6-signup-offline, không vào candidate. SHA256 của sanitized export phải tách khỏi hash source gốc nếu redactions đổi bytes; không tuyên bố chúng tương đương.

Không public token/config/session, SIDs/account/tenant/device names, raw ACL/exception, directory listings hoặc source paths ngoài scope. Error chỉ type/code/step; native API error không gọi là process exit, cmdlet status riêng. Nếu report thất bại giữ result metadata và STOP, không retry thu thập.

STOP trước mọi mutation/acquisition nếu source không rõ/không complete/current, roots overlap hai chiều, sync/ACL/volume/reparse UNKNOWN, candidate drift cần probe chưa được duyệt, hoặc command vượt allowlist. Không doctor auto-repair, không silent restart/config changes. Các kết quả partial chỉ ghi UNKNOWN/BLOCKED, không dùng làm permission tạo quarantine.

## Fallback human-only khi provenance không thể thiết lập

Ưu tiên human cung cấp sanitized migration/source hiện có với provenance, gắn function identity/body fingerprint đã biết. Human đọc/biên tập bằng công cụ riêng; Codex/ChatGPT không xem raw. Không yêu cầu password, token hoặc connection string vào chat. Nếu source hiện có không đủ, human-only ONE signup definition acquisition từ test project là approval riêng, không được phép bởi request này.

Raw giữ ngoài các tool channels/C2C; human tự kiểm tra/redact và sau đó approve exact sanitized derivative/destination cho Codex và ChatGPT. Ghi original fingerprint riêng, SHA256 sanitized riêng, redaction categories và những semantics chưa biết. Không đưa nguyên database definition/log vào chat, screenshot hoặc workspace. Nếu load-bearing logic bị redacted, giữ unresolved thay vì invent behavior. Human-only không được diễn giải thành quyền Codex tự tạo quarantine/chạy query hoặc bypass safeguards.

## Independent human approval request

Hiện xin review request, không xin quyền chạy một exporter không xác định. Human chọn cung cấp một nguồn secret-free P1/P2 đã sanitize có provenance, hoặc dùng fallback sanitized-source; không cần gửi secret. Khi có nguồn cụ thể, Codex chuẩn bị exact read-only request/hash cho từng P1/P2/P3 và xin permission riêng. P4 wrapper/security design, provisioning, postcheck, console proof, ONE signup acquisition và sanitized release tiếp tục độc lập.

Checklist phê duyệt tương lai phải nêu exact source/path/tool/hash, trường metadata được phép, nguồn completeness/current deployment, one-attempt/no-retry, output sanitize/CreateNew và STOP on UNKNOWN. Chỉ approve mục được human chọn, không blanket P1–P4 hoặc chain sang database. Không sử dụng lại prior read-only attempt đã consumed.

## Validation / preservation

Lượt này chỉ thêm document; không chạy P1/P2/P3/P4, Test-Path, Get-Volume/Get-Acl, connector state read hay raw acquisition. HEAD 96f4be8575718d50eab2285ab5241d1583f3423a, index SHA256 2CCEC39D9D69A39044F41840197966E9D329EC3DEF5935BF7372CE342253888A giữ nguyên. Không source/test/build thay đổi; tests app không cần chạy cho tài liệu. Approach A; preserve SET NULL; no Auth hard-delete. NEXT_EXPECTED_STEP: STOP for ChatGPT review và human quyết định nguồn provenance/fallback riêng.

## ChatGPT review / human source checkpoint

Request được chấp nhận cho offline source decision; provisioning/signup acquisition NOT APPROVED. P1/P2 chưa có authoritative source, P3 chỉ đủ cơ sở chuẩn bị request riêng, P4 chưa có implementation/runtime proof. ChatGPT đề nghị human chọn A — human-only sanitized existing signup/migration source (khuyến nghị), hoặc B — cung cấp secret-free authoritative metadata roots/sync để chuẩn bị P1/P2 riêng. Chưa chọn thay human hoặc coi UI default A là approval. Cả hai hướng đều cần provenance, sanitization/release/checkpoint riêng, không cấp quyền DB/raw. STOP tại QUARANTINE_PROVENANCE_REQUEST_READY.
