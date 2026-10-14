# Yêu cầu kiểm tra môi trường quarantine READ ONLY

[C2C]
STATE: QUARANTINE_ENVIRONMENT_REQUEST_READY
TASK_ID: c2c_a73f
ITERATION: 6
WORKSPACE: selltime_project / e9c367fdc841
EXECUTION_APPROVAL: NOT GRANTED
LIVE_ACQUISITION: BLOCKED

## Mục tiêu và giới hạn

Xin một attempt kiểm tra metadata read-only tại candidate duy nhất C:\Users\admin\AppData\Local\SellTimeAuthEvidencePrivate. Không tạo thư mục, liệt kê contents, tạo marker, mở raw file, đọc credential/config có token, thay ACL/connector hay gọi PostgreSQL. Lượt hiện tại chỉ viết request; không thực hiện bất kỳ lệnh candidate nào dưới đây.

Phê duyệt request này chỉ thu thập evidence môi trường, không chứng nhận privacy hoặc cho phép acquisition. Nếu candidate chưa tồn tại, ghi CANDIDATE_ABSENT rồi STOP; không dùng ACL của parent để tuyên bố candidate an toàn và không tự tạo candidate. Có thể trả PARTIAL/BLOCKED hợp lệ khi thiếu evidence.

## Allowlist công cụ/lệnh chính xác — chưa chạy

Dùng Windows PowerShell user hiện tại, không Administrator, không ExecutionPolicy bypass. Chỉ metadata tại literal paths; tuyệt đối không -Recurse, wildcard, Get-ChildItem home, registry/config dump, cloud-provider enumeration, search contents hoặc connector file-read probe.

### A. Identity trước kiểm tra

- Connector Codex with ChatGPT · selltime_project: workspace_info({}) duy nhất, name/ID phải khớp.
- `git -C "C:/Users/admin/OneDrive/Desktop/selltime_project" rev-parse HEAD` và `git -C "C:/Users/admin/OneDrive/Desktop/selltime_project" status --short`.
- `Get-FileHash -LiteralPath 'C:/Users/admin/OneDrive/Desktop/selltime_project/.git/index' -Algorithm SHA256`.

Không dùng doctor trong execution allowlist này: doctor có thể sửa hạ tầng. Nếu connector identity không trả đúng hoặc mất kết nối ⇒ STOP, không tự recovery trong checkpoint.

### B. Candidate existence và ancestors

Lệnh đầu tiên: `Test-Path -LiteralPath 'C:\Users\admin\AppData\Local\SellTimeAuthEvidencePrivate' -PathType Container -ErrorAction Stop`.

Nếu false/error ⇒ STOP trước các bước khác. Nếu true, gọi `Get-Item -LiteralPath <P> -Force -ErrorAction Stop` cho đúng sáu P sau, theo thứ tự từ root xuống candidate:

1. C:\
2. C:\Users
3. C:\Users\admin
4. C:\Users\admin\AppData
5. C:\Users\admin\AppData\Local
6. C:\Users\admin\AppData\Local\SellTimeAuthEvidencePrivate

Chỉ giữ Container/Attributes, không đọc Target/link destination/contents. ReparsePoint bất kỳ ancestor ⇒ STOP không resolve qua nó. Offline/RecallOnOpen/RecallOnDataAccess hoặc dấu hiệu cloud placeholder ⇒ STOP. Không có các attributes này không chứng minh cloud exclusion.

### C. Canonical path (chỉ khi B thành công)

Python sẵn có C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe; chỉ đúng command này, không import app hoặc script không review:

```powershell
& 'C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' -c 'from pathlib import Path; import os,json; p=Path(r"C:\Users\admin\AppData\Local\SellTimeAuthEvidencePrivate"); q=p.resolve(strict=True); print(json.dumps({"canonical_matches_literal":os.path.normcase(str(q))==os.path.normcase(str(p)),"candidate_is_directory":q.is_dir()}))'
```

Đây là path metadata read, không list/read contents. Strict resolve lỗi, alias khác literal hoặc không directory ⇒ STOP. Re-check attributes bằng đúng Get-Item allowlist ở B sau resolve; drift ⇒ STOP. Pre/post checks không loại trừ mọi TOCTOU; không chứng nhận an toàn lâu dài hoặc cho collector chạy bằng path không khóa. Future acquisition cần ràng buộc identity/handle riêng.

### D. ACL metadata (candidate duy nhất)

`Get-Acl -LiteralPath 'C:\Users\admin\AppData\Local\SellTimeAuthEvidencePrivate' -ErrorAction Stop`.

Để so sánh principal mà không dump account names: `[System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value` và `.Groups` chỉ dùng trong memory để xét current identity/group membership. Không in SID/group names hoặc credential. Chỉ lấy owner, AreAccessRulesProtected và Access rules, không SACL/audit/subdirectory ACL.

Allowlist principal ĐỀ XUẤT cần human chốt cùng execution approval: current Windows user, LOCAL SYSTEM và BUILTIN Administrators. Báo riêng admin/system có quyền; không tuyên bố private khỏi OS administrator. Human có thể yêu cầu allowlist hẹp hơn nhưng không tự thay ACL để đạt. Access cho principal khác, inheritance/group membership chưa đánh giá đủ, hoặc effective rights không quyết định chắc chắn ⇒ ACL_UNVERIFIED/STOP. Get-Acl DACL và current groups là evidence, không phải full effective-access engine; nested/domain groups hay backup privileges vẫn có thể gây UNKNOWN.

### E. Cloud sync/index/export và connector roots

Không có lệnh quét registry/home/cloud apps/processes/services trong allowlist. File attributes chỉ là dấu hiệu phụ. NotContentIndexed nếu có chỉ nói về attribute của Windows indexing, không loại trừ backup/sync/agent khác. Cần human cung cấp attest metadata không chứa secret từ nguồn quản trị được phép: scope sync/index/export, timestamp, cơ chế áp dụng, và những giới hạn chưa kiểm chứng. Thiếu evidence ⇒ SYNC_UNKNOWN; không suy ra PASS vì đường dẫn ở AppData/Local.

workspace_info chỉ chứng minh identity workspace, không liệt kê tất cả active read roots. Cần nguồn runtime/deployed connector roots được chứng minh đầy đủ và không chứa token: danh sách canonical roots, deployed build identity, guard path provenance và timestamp. Source code guard/hashes, rootAlias, doctor healthy hoặc manifest workspace không đủ. Không đọc session/state/OAuth/config dump để tìm roots. Nếu không có nguồn safe đã được duyệt ⇒ ROOTS_UNKNOWN/STOP và đề xuất checkpoint nguồn evidence riêng; không mở rộng công cụ.

Kiểm tra overlap hai chiều (candidate chứa root hoặc root chứa candidate), junction aliases và freshness trên evidence đã được phép; overlap/unknown ⇒ BLOCKED. Không gọi connector read_file/search với path ngoài workspace hoặc thử đọc sentinel. Synthetic probe, nếu cần, là một approval khác.

## Output contract và nơi lưu

Tạo một evidence JSON mới CreateNew trong _bmad-output/implementation-artifacts/verification-6-signup-offline/quarantine-env-readonly-<UTC>-<GUID>.json của workspace; tuyệt đối không ghi vào candidate. Không transcript/stdout dump Get-Acl hay Identity.Groups. Public fields chỉ gồm task/workspace, attempt UTC, từng step status/exit, candidate constant, canonical boolean, attribute flags, owner/current/SYSTEM/Administrators class, OtherPrincipalPresent boolean, DACL protected flag, root/sync evidence provenance đã sanitize, blocker codes và overall PARTIAL/BLOCKED/VERIFIED_METADATA_ONLY.

Không ghi SID/account name của unrelated principals, raw SDDL, tenant/device identifiers, token, cookies, session/config contents, filesystem listings, personal paths hoặc exception messages. Nếu cần giữ principal khác, dùng SHA256 SID label trong memory thay vì SID/name; không cần phát hành hash đó nếu chỉ OtherPrincipalPresent đã đủ. Errors chỉ phát hành type/code và step; nội dung lỗi có thể chứa data riêng nên không paste nguyên văn. Mọi output kiểm tra local trước C2C release.

Các PowerShell cmdlet không có native exit riêng; ghi CmdletStatus SUCCESS/ERROR. Python có native exit thật, lưu ngay sau invocation, không dùng exit wrapper thay thế. Reporting failure ghi riêng, không đổi kết quả step. Không retry; không sửa permission hoặc dùng Administrator khi AccessDenied.

## Fail-closed acceptance / STOP

1. Sai workspace/hash/HEAD hoặc user-work conflict ⇒ STOP trước candidate.
2. Candidate absent, access denied, reparse/cloud flags, resolve mismatch/drift ⇒ STOP; không create/repair.
3. ACL không đủ chứng minh, allowlist chưa được human chốt, roots/sync source incomplete ⇒ PARTIAL_BLOCKED; không tuyên bố verified isolation.
4. Unexpected content/secret/schema hoặc phát sinh lệnh ngoài allowlist ⇒ STOP, giữ private, không publish.
5. Dù đủ evidence metadata, kết quả không cấp quyền chạy psql, nhập password, bật SQL derivative hay đọc signup definition. Console verification và ONE signup acquisition vẫn hai approval riêng.

## Human decision đề nghị

Phê duyệt hoặc từ chối đúng một attempt environment metadata read-only theo allowlist A–E, candidate cố định, allowlist principal đề xuất, output contract và no-retry ở trên. Việc thu thập attest roots/sync ngoài những nguồn đã duyệt không nằm trong approval; nếu thiếu, Codex báo UNKNOWN và STOP. Không xin quyền database trong request này.

## Preservation và tình trạng

Lượt chuẩn bị chỉ thêm document này; không probe/create candidate, đổi ACL/connector, chạy psql/SQL, đọc definitions/credential hoặc đổi Git. HEAD trước chuẩn bị: 96f4be8575718d50eab2285ab5241d1583f3423a. Index SHA256: 2CCEC39D9D69A39044F41840197966E9D329EC3DEF5935BF7372CE342253888A. User dirty work và staged deletion giữ nguyên. Approach A; preserve SET NULL; no Auth hard-delete. NEXT_EXPECTED_STEP: STOP for ChatGPT review and human environment-only approval.

Validation chuẩn bị: PowerShell parser kiểm tra cú pháp command C với 0 parse errors; command không được thực thi. Chưa kiểm thử native argument forwarding/resolve trên candidate thật. workspace_info qua đúng connector trả selltime_project/e9c367fdc841/master/96f4be8, dirty=true. Full HEAD/index local recheck giữ nguyên. Không chạy doctor auto-repair hoặc command B–E. Không cần app test/build vì chỉ tạo request tài liệu.

## Review và handoff được ghi nhận

ChatGPT REQUEST_REVIEW: PASS; chấp nhận allowlist, absence STOP, ACL limitations, roots/sync UNKNOWN và phân biệt cmdlet status/native exit. Không yêu cầu sửa request trước checkpoint human.

Sau review, trang C2C hiển thị một user-authored message phê duyệt ONE environment metadata attempt với allowlist/principals ở trên, rồi ChatGPT trả EXECUTE_QUARANTINE_ENVIRONMENT_READ_ONLY. Đây là handoff được quan sát trong chat C2C, không phải bằng chứng commands đã chạy hoặc isolation đã đạt. Lượt PREPARE_QUARANTINE_ENVIRONMENT_REQUEST hiện tại kết thúc trước candidate access; candidate existence/ACL/roots/sync vẫn chưa được kiểm tra. Live signup/psql/definition approval tiếp tục không được cấp.
