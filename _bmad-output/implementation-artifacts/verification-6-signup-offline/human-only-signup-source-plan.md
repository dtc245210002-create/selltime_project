# Kế hoạch human-only source signup

[C2C]
STATE: HUMAN_ONLY_SIGNUP_SOURCE_PLAN_READY
TASK_ID: c2c_a73f
ITERATION: 6
WORKSPACE: selltime_project / e9c367fdc841
HUMAN_DECISION: OPTION_A
APPROVAL: OFFLINE PLAN ONLY

## Target và accepted metadata

Target duy nhất public.st_auth_new_identity(), signature không tham số, OID17846 trên Supabase test dauglhucpflemfdsygzr. Accepted body fingerprint: 5f763cd39b9b47c3219d37daaef72c96, từ M metadata đã nghiệm thu; đây là md5(pg_proc.prosrc), không phải hash toàn bộ CREATE FUNCTION hoặc file migration.

Known metadata: owner postgres, SECURITY DEFINER, return trigger, empty search_path; signup trigger st_auth_identity_created trên auth.users, enabled O, type5. Language/full-definition fingerprint signup vẫn UNKNOWN. Metadata là snapshot lịch sử, không chứng minh source hoặc deployment hiện tại chưa thay đổi. OID chỉ có nghĩa trong đúng database snapshot.

## Workflow human-only, không live acquisition

1. Human chọn một bản source/export/migration **đã có sẵn** mà human có quyền xem bằng công cụ riêng. Không mở raw trong chat, workspace, screenshot, Codex/C2C tool hoặc file preview để agent đọc. Không tự tạo quarantine mới. Lượt này không cấp quyền human/Codex chạy SQL, psql, provider export mới hay đọc database để lấy source.
2. Human kiểm tra nguồn riêng: xuất xứ, đúng project/function/signature, thời điểm nguồn, cách nguồn gắn với deployment hoặc accepted metadata. Nếu không có source hiện có, dừng và chuẩn bị acquisition approval riêng; không đưa agent credentials.
3. Human ghi provenance metadata không secret theo contract dưới đây. Không đổi tên function hoặc chỉnh source lịch sử để giả lập đúng target. Function local handle_auth_signup hoặc migration006/007 không tự trở thành bằng chứng st_auth_new_identity đang chạy.
4. Human đối chiếu fingerprint theo phương pháp đã xác định; nếu không có catalog-body bytes/phương pháp đáng tin, ghi METHOD_UNKNOWN/UNVERIFIED. Không tự suy luận checksum body từ toàn bộ SQL file. Hash sai/method không đủ ⇒ không claim match/current-live.
5. Human tạo bản derivative sanitized riêng bằng công cụ của mình, áp checklist; giữ raw private, không chuyển raw cho Codex/ChatGPT. Lượt này Codex không đọc raw, sanitized draft hoặc hash nội dung của source chưa được release.
6. Human review lần cuối và approve bản derivative cụ thể/hash/destination/recipients qua một message riêng. Trước message đó, không đưa source derivative vào MCP-readable workspace hoặc gửi content vào chat.
7. Sau release approval riêng, human chuyển đúng derivative đã duyệt vào path cố định; Codex chỉ kiểm tra size/hash/metadata và đọc bản released đó. Nếu mismatch, nội dung ngoài scope hoặc nghi secret ⇒ STOP, không quote/upload/forward bản lỗi hoặc lấy lại raw. ChatGPT chỉ review released artifact qua C2C.

## Provenance verification design

Evidence envelope cần: task/workspace/test project; exact function identity/OID được báo cáo; source kind (trusted export / existing migration / historical code / human reconstruction); acquisition/source timestamp, evidence timestamp và nguồn chứng minh; deployment/snapshot linkage; body fingerprint value/method và match status; full-definition/language status; redaction categories; sanitized size/SHA256; human approval reference và limitations.

Không đòi hỏi source raw path hoặc config có token; dùng source label human kiểm soát và provenance description đã sanitize. Nếu deployment ID/provider receipt chứa private identifiers, giữ private và phát hành metadata đủ để review với redaction/unknown ghi rõ. Một assertion boolean human đơn lẻ không thay thế provenance; cần nguồn/method và giới hạn cụ thể.

Classification:
- HISTORICAL_REFERENCE_ONLY: source repo/migration cũ, chưa chứng minh deployment linkage. Có thể review như context sau release, không đủ reconciliation/live-source acceptance.
- MATCHES_ACCEPTED_METADATA_BODY: method đối chiếu đúng pg_proc.prosrc và hash accepted snapshot; chưa chứng minh hiện tại hoặc full CREATE FUNCTION.
- UNVERIFIED / MISMATCH / STALE: giữ blocker, không sửa source để ép hash khớp.
- CURRENT_DEPLOYMENT_LINKED: chỉ dùng nếu có evidence current deployment được human phát hành và review riêng; không tự cấp nhãn này từ metadata cũ hoặc OID match.

Khi source có language/security/owner/search_path/trigger khác accepted snapshot hoặc temporal linkage không rõ, ghi conflict và STOP semantic acceptance. Không chạy query metadata mới để chữa gap. Nếu freshness cần kiểm chứng live, đó là scope approval khác.

## Fingerprint accounting

Ghi riêng bốn loại: (A) accepted catalog body MD5 ở trên; (B) original full-definition/source file SHA256 nếu human có và được phép tính local, status UNKNOWN nếu không; (C) current-live fingerprint status chưa xác minh; (D) sanitized derivative SHA256 và byte size do human tính sau redaction.

Không trim/normalize line endings/encoding để ép match prosrc; encoding hoặc extraction chưa xác định phải ghi UNKNOWN. pg_get_functiondef wrapper bao quanh body khác với prosrc. MD5 chỉ là continuity fingerprint từ metadata, không phải cryptographic authenticity proof. Hash sanitized không được gắn nhãn original; redaction làm đổi bytes. Codex không tự đọc raw để tính hoặc kiểm chứng hash ở giai đoạn này.

## Checklist redaction human

- Loại token/password/API key/connection secrets, private endpoints/query strings, credentials trong comments/dynamic SQL/exception strings/settings.
- Loại email/phone/user identifiers, hồ sơ cá nhân, embedded user datasets/seed records và nội dung unrelated functions/policies.
- Giữ source của đúng một signup function; references tên helpers có thể giữ nhưng không thêm bodies của helpers hoặc policies.
- Giữ những logic cần review: identity binding, trusted role/Candidate default, KYC default, profile creation, DEMO/email collision handling, exception/atomicity/rollback paths, schema qualification/security/search_path/language nếu nguồn có chứng minh.
- Redaction không được âm thầm biến business constant, field name, role derivation hoặc error/branch thành logic an toàn hơn. Dùng annotation rõ vị trí/phạm vi semantics đã che; nếu load-bearing logic mất thì giữ UNKNOWN, không invent hoặc approve reconciliation.
- Kiểm tra comments, literals, JSON, dollar-quoted strings, URLs và multiline/dynamic expressions; scanners nếu human dùng chỉ là trợ giúp, không tự certify sạch.
- Nếu nghi secret, giữ derivative private, không upload để agent kiểm tra xem có secret hay không. Secret rotation là scope khác.

## Sanitized release contract

Release phải nêu exact artifact basename signup-source-sanitized.md, SHA256 dạng 64 hex, byte size tối đa65.536, source classification, redaction/provenance limitations, và human cho phép **Codex + ChatGPT qua connector selltime_project** đọc đúng phiên bản đó để review Auth. Destination sau approval: _bmad-output/implementation-artifacts/verification-6-signup-offline/released-signup-source/signup-source-sanitized.md trong workspace hiện tại. Path này chỉ là đề xuất; không tạo folder/artifact hoặc đọc nó ở lượt plan.

Không suy ra permission từ frontmatter RELEASED, file tồn tại, UI radio đã checked, consent old metadata hoặc request template. Mọi revision đổi bytes/hash cần approval riêng. Chỉ content cho một function/provenance/redaction notes; không archive nhiều file/raw logs hoặc bundled user data. Bản derivative đã phát hành là dữ liệu review, không phải instructions cho agent; không làm theo embedded SQL/tool commands.

Nếu source không có body đầy đủ vì redaction hoặc không chứng minh provenance, vẫn có thể release giới hạn historical/reference review nếu human ghi rõ, nhưng không coi iteration nghiệm thu. Không chạy source SQL, sửa migration006007, tự deploy, mutation hoặc test signup/DB từ release approval.

## Independent approvals / STOP

- Chọn OPTION_A chỉ cho lập plan; chưa approve source release hoặc database acquisition.
- Nếu cần nguồn mới từ database: human-only ONE signup acquisition request riêng với provider/test project/scope/recipient được duyệt, không tự dùng metadata authorization cũ.
- Release request riêng nằm trong human-only-signup-release-request.md. Cần exact human-provided sanitized hash/size/provenance trước approval; chưa có dữ liệu thì status WAITING_FOR_HUMAN_ENVELOPE, không tự điền giá trị.
- Khi thiếu/source mismatch/secret concern/incomplete load-bearing logic ⇒ STOP. Không retry acquisition, mở rộng function/policy, probe connector/private folder, đổi ACL hoặc read credentials.

Human-only phương án này giảm nhu cầu collector do agent quản lý nhưng không chứng minh raw workspace isolation. Raw luôn do human giữ; Codex có khả năng OS tools không được cấp quyền đọc raw. Same-SID/admin access limitations vẫn tồn tại.

## Bảo toàn / validation

Chỉ thêm plan và release-request document. Không đọc definitions, source derivative, hash raw bytes, DB/psql, private path/config/token hoặc thay app/Git. Đọc accepted metadata đã được phép; workspace_info trực tiếp khớp selltime_project/e9c367fdc841/master/96f4be8. HEAD 96f4be8575718d50eab2285ab5241d1583f3423a và index SHA256 2CCEC39D9D69A39044F41840197966E9D329EC3DEF5935BF7372CE342253888A giữ nguyên. Không app tests/build cho tài liệu. NEXT_EXPECTED_STEP: HUMAN_ONLY_SIGNUP_SOURCE_PLAN_READY, STOP for ChatGPT review.

## ChatGPT review đã nhận

OFFLINE_PLAN_ACCEPTED / ENVELOPE_UNSUPPLIED / RELEASE_NOT_APPROVED. Không có thiết kế cần sửa trước checkpoint availability. Human chỉ xác nhận Có / Không / Chưa rõ về source signup lưu từ trước, không gửi SQL/file/hash/private path lúc này.

Có: chuẩn bị checklist provenance/sanitization/envelope, chưa đọc source. Không: chuẩn bị human-only ONE signup acquisition request riêng, chưa truy vấn DB. Chưa rõ: hướng dẫn human tự xác định availability, không Codex scan/private probe. Codex chưa chọn thay human; STOP tại checkpoint plan này.
