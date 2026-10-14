# Request phát hành sanitized signup source — chưa approve

TASK_ID: c2c_a73f / ITERATION: 6 / selltime_project / e9c367fdc841.
TARGET: public.st_auth_new_identity(), OID17846, test project dauglhucpflemfdsygzr.
ACCEPTED_BODY_MD5: 5f763cd39b9b47c3219d37daaef72c96 (metadata snapshot; không full/live hash).
STATUS: WAITING_FOR_HUMAN_ENVELOPE. RELEASE_APPROVAL: NOT GRANTED.

## Human envelope cần trước release

Chỉ cung cấp metadata không secret, chưa gửi code hoặc raw source:

| Trường | Tình trạng hiện tại |
|---|---|
| Source label/kind và provenance/method | UNSUPPLIED |
| Source/snapshot timestamp và linkage với target/test project | UNSUPPLIED |
| Fingerprint method/status (đúng prosrc hoặc reference-only) | UNSUPPLIED |
| Signup language/full-definition status | UNKNOWN |
| Sanitized artifact basename | signup-source-sanitized.md |
| Sanitized byte size (<=65.536) | UNSUPPLIED |
| Sanitized SHA256 (64 hex) | UNSUPPLIED |
| Redaction categories và load-bearing unknowns | UNSUPPLIED |
| Human manual-review attestation | UNSUPPLIED |

Các unknown/unsupplied là trạng thái request, không placeholders để agent tự invent. Nếu envelope chưa đầy đủ, chỉ báo WAITING/BLOCKED; không mở file chưa phát hành để điền metadata.

## Phạm vi phê duyệt độc lập

Human phê duyệt đúng basename/hash/size/source classification và destination dưới đây, cho Codex và ChatGPT đọc **chỉ sanitized derivative** để review signup semantics; không cho raw hoặc function khác. Destination sau approval:

C:/Users/admin/OneDrive/Desktop/selltime_project/_bmad-output/implementation-artifacts/verification-6-signup-offline/released-signup-source/signup-source-sanitized.md

Chưa tạo/read path này. Human giữ raw private và chỉ chuyển derivative đã duyệt sau approval; không gửi raw qua clipboard/chat/browser hoặc workspace để agent sanitize. Không lặp lại consent từ database metadata; source release có recipient/data/hash riêng.

## Mẫu approval để human dùng khi đã có envelope

“Tôi cho phép Codex và ChatGPT qua connector selltime_project đọc bản signup-source-sanitized.md với SHA256 và byte size chính xác trong envelope tôi đã cung cấp, thuộc target public.st_auth_new_identity() trên test dauglhucpflemfdsygzr, ở destination đã nêu. Tôi đã kiểm tra/redact dữ liệu nhạy cảm và chấp nhận giới hạn provenance/semantics đã ghi. Chỉ review bản sanitized này; không đọc raw, truy vấn database, thực thi source, mở rộng functions/policies hoặc triển khai migration/production. Hash/content khác ⇒ STOP và cần release approval mới.”

Đây là template không có hiệu lực khi chưa có hash/envelope và human authorization thực tế. Không auto-fill SHA256 của plan/request thay cho source. Nếu source chỉ historical/reference, approval phải nêu rõ không đủ live-source proof.

## STOP / bằng chứng sau approval

Trước đọc content released: đối chiếu human authorization, exact literal path, size/hash, format và scope. Mismatch hoặc file khác ⇒ STOP, không fallback đọc raw/source sibling. Sau đọc nếu nghi secret/unrelated code/user data, không quote/forward nó; báo category/blocker, giữ review halted. Không phát hành thành công chỉ vì scanner không phát hiện.

Evidence cần phân biệt original catalog hash, sanitized SHA256, provenance classification, redaction gaps và semantics quan sát. Request này không cho Codex compute hash raw hoặc thu thập source mới. Không thay Git/credential/ACL, chạy SQL/source hoặc bật Auth LIVE. STOP for ChatGPT review và independent human release decision.
