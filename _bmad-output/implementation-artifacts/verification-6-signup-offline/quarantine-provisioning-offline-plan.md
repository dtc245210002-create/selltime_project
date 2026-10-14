# Kế hoạch provisioning quarantine offline

[C2C]
STATE: QUARANTINE_PROVISIONING_PLAN_READY
TASK_ID: c2c_a73f
ITERATION: 6
WORKSPACE: selltime_project / e9c367fdc841
EXECUTION_APPROVAL: NOT GRANTED

## Hiện trạng và phạm vi

Evidence đã nghiệm thu xác định candidate vắng mặt tại attempt trước. Quyền read-only trước đã sử dụng; không retry Test-Path trong lượt này. Chỉ soạn plan/draft, không tạo candidate, đổi ACL, đọc private filesystem/credential, probe connector, chạy psql/DB hoặc definitions. Không sửa migration/app/Git; giữ Approach A, SET NULL, no Auth hard-delete.

Candidate cố định: C:\Users\admin\AppData\Local\SellTimeAuthEvidencePrivate. Không suy ra private chỉ vì AppData. Không thay path, tạo parents hay lấy thư mục khác làm template. Không nhầm root quarantine với workspace mock folders vốn chứa synthetic.

## Ownership / ACL / inheritance đề xuất

Owner: SID của đúng Windows user hiện tại, phải đối chiếu là account admin đang được human dùng; SID chỉ giữ trong memory, không dump account/group names. Không takeown, chạy Administrator hoặc enable privilege để đặt owner khác.

Protected DACL mới: đúng ba principal current user, LOCAL SYSTEM (SY), BUILTIN Administrators (BA), mỗi principal Allow FullControl với ObjectInherit/ContainerInherit. Không Everyone, Users, Authenticated Users, service identities khác, deny rules hoặc inherited ACE từ parent. Đây là đề xuất write policy; phê duyệt đánh giá các principal trước đó không cho phép tạo/chỉnh ACL. Cần human approve quyền tạo mới với ACL này riêng.

Owner/current user có FullControl để mở/kiểm tra/sanitize local; SYSTEM/Administrators có quyền đọc/sửa và không bị cô lập khỏi raw. Các process chạy cùng SID cũng không bị ACL này loại trừ. Privilege/backup/domain membership có thể vượt mô hình DACL; không tuyên bố bảo vệ khỏi administrator hay agent cùng account. Không tăng quyền connector để xử lý hạn chế.

Không dùng create-then-Set-Acl vì có khoảng thời gian thư mục mang ACL parent. Draft dùng Win32 CreateDirectoryW với SECURITY_ATTRIBUTES và protected security descriptor ngay lúc tạo. API tạo một leaf và trả lỗi nếu đã tồn tại/parent thiếu; không cập nhật object tồn tại. [CreateDirectoryW, Microsoft](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-createdirectoryw). D:P bật protected DACL; owner O: và ba ACE được xác định trước. [SDDL, Microsoft](https://learn.microsoft.com/en-us/windows/win32/secauthz/security-descriptor-string-format).

## Prerequisites bắt buộc trước mutation — chưa được thực thi

Checkpoint human phải bind exact candidate, tạo leaf mới duy nhất, descriptor, wrapper/hash và user không elevated; không quyền sửa candidate có sẵn. Kiểm tra workspace/HEAD/index/user work trước. Nếu existing candidate xuất hiện trong preflight hoặc API ERROR_ALREADY_EXISTS ⇒ STOP không overwrite/setacl/retry.

Preflight read-only riêng cần phạm vi mới, không tái sử dụng attempt cũ: literal parent/ancestors, canonical/root identity, reparse/junction/cloud flags, permissions để tạo leaf, volume hỗ trợ persistent ACLs. Không follow link, enumerate home/contents, create parent, đọc config có token hoặc sửa filesystem policy. Sai path/volume/access/owner ⇒ STOP. Parent swap/TOCTOU chưa được giải quyết chỉ bằng Test-Path; executable implementation cần cách ràng buộc ancestor identity/handles và recheck trước/sau. Draft API dưới đây không tự cung cấp race-proof guarantee.

Active connector canonical read roots/deployed identity và sync/index/export provenance phải có nguồn đầy đủ đã được phép, không chứa secret. Source guard, workspace_info/doctor khỏe và registry parent name không đủ. Nếu roots/sync không chứng minh được, gate privacy giữ UNKNOWN và không đặt raw vào candidate; live provisioning execution readiness cũng giữ BLOCKED cho đến review prerequisite đầy đủ. Không probe private path qua connector hoặc tạo marker để đo roots theo quyền provisioning này.

## Draft lệnh tạo — chỉ để review, hard-disabled

Không có file executable được chuẩn bị ở lượt này. Code block minh họa dưới đây không được chạy; chỉ được chuyển thành wrapper có exact hash sau review/approval riêng. Cờ trong draft cố định false; việc đổi cờ làm mất tính tương đương với artifact đã review. Các evidence placeholders không phải user authorization.

```powershell
$provisioningHumanApproved = $false
if (-not $provisioningHumanApproved) { throw 'HALT: OFFLINE DRAFT, no mutation approval' }
$provisioningCandidate = 'C:\Users\admin\AppData\Local\SellTimeAuthEvidencePrivate'
# STOP ở đây nếu preflight/roots/sync/volume/ancestor identity còn UNKNOWN.
throw 'HALT: verified prerequisites and race-safe wrapper not implemented'

# Nhánh dưới chưa thể đến được trong draft này.
$provisioningUserSid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value
$provisioningSddl = 'O:' + $provisioningUserSid + 'D:P(A;OICI;FA;;;' + $provisioningUserSid + ')(A;OICI;FA;;;SY)(A;OICI;FA;;;BA)'
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class QuarantineCreationDraft {
    [StructLayout(LayoutKind.Sequential)]
    public struct SecurityAttributes {
        public int Length;
        public IntPtr Descriptor;
        [MarshalAs(UnmanagedType.Bool)] public bool InheritHandle;
    }
    [DllImport("advapi32.dll", CharSet=CharSet.Unicode, ExactSpelling=true, SetLastError=true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool ConvertStringSecurityDescriptorToSecurityDescriptorW(
        string text, uint revision, out IntPtr descriptor, out uint size);
    [DllImport("kernel32.dll", CharSet=CharSet.Unicode, ExactSpelling=true, SetLastError=true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool CreateDirectoryW(string path, ref SecurityAttributes attributes);
    [DllImport("kernel32.dll")]
    public static extern IntPtr LocalFree(IntPtr memory);
}
'@
$provisioningDescriptor = [IntPtr]::Zero
$provisioningDescriptorSize = [uint32]0
try {
    if (-not [QuarantineCreationDraft]::ConvertStringSecurityDescriptorToSecurityDescriptorW(
        $provisioningSddl, 1, [ref]$provisioningDescriptor, [ref]$provisioningDescriptorSize)) {
        throw 'HALT: descriptor conversion failed'
    }
    $provisioningAttributes = New-Object QuarantineCreationDraft+SecurityAttributes
    $provisioningAttributes.Length = [Runtime.InteropServices.Marshal]::SizeOf($provisioningAttributes)
    $provisioningAttributes.Descriptor = $provisioningDescriptor
    $provisioningAttributes.InheritHandle = $false
    $provisioningCreated = [QuarantineCreationDraft]::CreateDirectoryW(
        $provisioningCandidate, [ref]$provisioningAttributes)
    $provisioningApiError = if ($provisioningCreated) { 0 } else { [Runtime.InteropServices.Marshal]::GetLastWin32Error() }
    # API error 183 -> already exists: STOP, không sửa ACL object đó.
    # Bất kỳ lỗi khác -> STOP, no retry/no privilege escalation.
    # Chỉ phát hành Created boolean/API error code; không raw SDDL/SID.
} finally {
    if ($provisioningDescriptor -ne [IntPtr]::Zero) {
        [QuarantineCreationDraft]::LocalFree($provisioningDescriptor) | Out-Null
    }
}
```

CreateDirectoryW áp descriptor lúc tạo khi volume hỗ trợ; điều này không chứng minh canonical path/race/cloud/connector exclusion. Add-Type ở trên chưa compile/runtime-test; API error không phải native process exit. Đặc biệt không thay draft bằng New-Item/Directory.CreateDirectory idempotent rồi Set-Acl lên một path có thể đã tồn tại.

## Post-provisioning verification — approval độc lập

Giữ thư mục mới empty; không copy fixtures/raw, tạo files/markers hoặc chạy collector. Lưu sanitized mutation receipt: exact path constant, created/not-created, API code, approval/hash, UTC, owner-current boolean, no-retry, partial-failure status. Các checks phải phân biệt Created với VerifiedPrivate.

Sau khi provision được human duyệt riêng và thực hiện, xin environment verification attempt mới: canonical/ancestor identity/no reparse, protected DACL, đúng explicit principals/rights/inheritance, không ACE lạ/null DACL, volume semantics, roots overlap cả hai chiều và sync/index/export evidence. Không dùng receipt tạo thư mục làm proof isolation. Chưa có quyền cho bước này hoặc cho console/psql/signup acquisition.

## Failure handling và rollback

- Create lỗi/183: giữ state NOT_CREATED, không chỉnh candidate có sẵn hoặc parent.
- Create thành công nhưng receipt/postcondition/error: ghi CREATED_UNVERIFIED hoặc CREATION_OUTCOME_UNKNOWN nếu mất trạng thái; cấm raw acquisition và STOP. Không thử create lại, broaden ACL, remove protected inheritance hoặc tự repair.
- Không có delete/move command trong approval provisioning. Rollback tự động: NONE. Giữ empty candidate mới với ACL ban đầu, báo human. Không nới quyền để dọn dẹp.
- Nếu human cần rollback: một approval khác cho đúng directory identity vừa tạo, chứng minh empty và không reparse/drift; chỉ leaf non-recursive deletion. Không delete nếu có dữ liệu hoặc identity không chắc chắn; không recursive cleanup/reset. Không xóa parent/runtime/user files, không khôi phục ACL cũ từ thư mục khác.

## Roots / sync evidence acquisition plan

Chuẩn bị request riêng chỉ metadata nguồn active connector roots/deployed guard đầy đủ, canonical aliases và timestamp, không OAuth/state/session dump. Cần source quản trị an toàn được human duyệt; hiện ROOTS_UNKNOWN. Sync/index/export evidence cần attest scope từ quản trị được phép; không tự scan apps/registry/home hoặc suy luận absence từ AppData. Nếu không có provenance đầy đủ, dừng và dùng phương án human cung cấp sanitized source với provenance thay vì raw collection — phương án đó cũng cần release approval riêng.

## Human checkpoint đề nghị — chưa thực thi

Request sau review phải tách: (1) provenance/preflight read-only đúng scope mới; (2) tạo một leaf với ACL/owner đề xuất và no overwrite/no retry, wrapper API đã kiểm thử synthetic/race review và exact SHA256; (3) post-provision verification read-only; (4) console proof; (5) ONE signup acquisition; (6) sanitized release. Không gộp thành quyền tạo rồi thu thập definitions.

Human cần đồng ý policy tạo mới, ba principal FullControl và inheritance protection, giới hạn same-SID/admin/backup exposure, no auto rollback. Không cần cấp quyền database để review plan. Do chưa có roots/sync/volume/ancestor evidence hoặc executable wrapper đã test, hiện chỉ READY_FOR_PLAN_REVIEW, NOT_READY_FOR_PROVISION_EXECUTION. Không xin approval thực thi một draft chưa đủ gates.

## Validation và bảo toàn

Lượt này chỉ thêm document plan. Không gọi Test-Path/ACL/probe candidate lần nữa, không compile Add-Type hoặc chạy API. App tests/build không chạy vì không sửa app. HEAD 96f4be8575718d50eab2285ab5241d1583f3423a; index SHA256 2CCEC39D9D69A39044F41840197966E9D329EC3DEF5935BF7372CE342253888A giữ nguyên. NEXT_EXPECTED_STEP: STOP for ChatGPT review; human approval riêng trước mọi mutation.

Validation offline: PowerShell Parser đọc code block, tìm được draft và trả 0 parse errors; Invoked=false, NativeApiCompiled=false. Không chứng minh P/Invoke/SDDL runtime hay atomic path identity. workspace_info trực tiếp xác nhận selltime_project/e9c367fdc841/master/96f4be8 dirty=true. Không chạy doctor repair hoặc private path command.

## Quyết định ChatGPT review

Plan được chấp nhận để tiếp tục chuẩn bị, NOT_READY_FOR_EXECUTION. Blockers: ROOTS_UNKNOWN, SYNC_UNKNOWN, ANCESTOR/VOLUME_UNVERIFIED, RACE_UNRESOLVED, WRAPPER_UNTESTED. ACL không cô lập process cùng SID, nên roots/access provenance vẫn bắt buộc.

Next handoff PREPARE_QUARANTINE_PROVENANCE_REQUEST: offline documentation only về source roots không secret, sync/index/export, ancestor/volume read-only proposal, path-swap risk, sanitized output/STOP và human-only fallback. Không candidate create/delete/Test-Path retry, ACL/ownership change, connector session/token/config reads, DB/psql/definitions, credentials hoặc Git mutations. Lượt này STOP tại QUARANTINE_PROVISIONING_PLAN_READY.
