---
id: SPEC-auth-reconciliation
status: awaiting-review
companions:
  - auth-reconciliation-spec.md
  - ../../implementation-artifacts/verification-6-signup-offline/auth-schema-reconciliation-design.md
sources: []
---
# SellTime Auth schema reconciliation

## Why
Schema test đang khác contract ứng dụng/006 và chặn 007. Human chọn approach A để thống nhất Auth, role và ownership, nhưng retention chưa chốt: giữ SET NULL và không Auth hard-delete. Đây là đặc tả offline, chưa implementation.

## Capabilities
- **CAP-1** — **intent:** Reviewer phân biệt contract mục tiêu và observed schema. **success:** Matrix trong companion có evidence, unknown và gate cho mỗi mismatch.
- **CAP-2** — **intent:** Signup tạo identity/profile riêng, không nâng quyền hoặc chiếm DEMO. **success:** Chỉ một handler hiệu lực, Candidate/KYC=false, atomic rollback, không email merge; handler hiện hữu chưa rõ body thì HALT.
- **CAP-3** — **intent:** Guard collation phân biệt drift thực sự và metadata default hợp lệ. **success:** Default dùng database version; mismatch/unknown/nondeterministic HALT; không refresh/change collation.
- **CAP-4** — **intent:** Người dùng mất binding không trở thành DEMO hoặc bị rebind. **success:** Giữ SET NULL, không Auth hard-delete; detached provenance/retention unresolved chặn writes và LIVE.
- **CAP-5** — **intent:** Reconciliation có trình tự và rollback được review. **success:** Plan có evidence, implementation và DB gates riêng; tests ownership/RLS/signup/guard/rollback trước acceptance.

## Constraints
- Chỉ tài liệu offline; bảo toàn dirty work/staged deletions/HEAD/index; không sửa 006/007/app hoặc query database.
- A nhắm contract Auth/RLS 006, ngoại lệ deletion giữ SET NULL. Không blind replay baseline hoặc tự đổi FK sang CASCADE.
- Evidence hash không chứng minh trigger semantics; không tạo handler thứ hai, backfill/rebind theo email hoặc tin role/client owner.
- Mọi implementation, evidence acquisition hoặc database execution cần scope phê duyệt riêng.

## Non-goals
- Hard-delete, lifecycle mới, retention thời hạn cụ thể, migrations/fixtures/DB repair, provider signup, credential access, Git mutations, deploy và Auth LIVE.

## Success signal
ChatGPT có thể review companion đủ bảy mục bắt buộc, với các quyết định human và blocker được phân biệt rõ. SPEC_READY không đồng nghĩa migration-ready hoặc Iteration 6 accepted.

## Open Questions
- Nguồn/semantics st_auth_new_identity và full RLS/ACL/helper/dependency inventory chưa có; phạm vi acquisition nào được human cho phép?
- Retention/deletion, provenance cho detached rows và contract được phép thay thế guard FK 007 chưa được quyết định.
