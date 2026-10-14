[C2C]
STATE: AUTH_EVIDENCE_M_EXECUTION_REQUEST_READY
TASK_ID: c2c_a73f
ITERATION: 6
WORKSPACE: selltime_project / e9c367fdc841
STATUS: OFFLINE VERIFIED — NO DB EXECUTION APPROVAL

## Exact M execution proposed

Project dauglhucpflemfdsygzr only; reviewed auth-evidence-catalog-draft.sql, SHA256 **9D3279B0683C8F7BABF972849934A3CE58219DE6B4ED4E748E234BFFB1EACD42**. Wrapper run-auth-evidence-m.ps1 rejects missing execution gate (40) or hash mismatch (41), before any native process. ApprovedExecution is a runtime guard, not evidence of human consent: Codex must receive explicit human authorization and verify workspace/TLS before invoking that mode. No execution in this preparation.

Session pooler aws-0-ap-northeast-1.pooler.supabase.com:5432, postgres.dauglhucpflemfdsygzr / postgres, CA C:/Users/admin/Downloads/prod-ca-2021.crt; verify-full, gssencmode disabled, client cert discovery disabled, missing passfile check, process-only PG env cleared, password prompted locally (-W), psql -X/ON_ERROR_STOP/pageroff and default_transaction_read_only. No credential values inspected or persisted. No elevated user/Administrator or system environment changes.

Before execution: verify workspace_info selltime_project/e9c367fdc841, local HEAD/index and SQL hash; verify endpoint/CA/hostname/TLS using previously reviewed no-auth handshake. Failure → STOP, no psql. Wrapper selects exactly M file; no file-path/query override or auto-retry. Only catalog metadata/hashes and fixed allowlists; user rows/counts/function bodies/policy expressions excluded. No F draft invocation.

Outputs: new m-executed-UTCtimestamp-GUID directory, catalog.log/native.exit.txt/status.json; existing evidence not overwritten. Native exit immediately captured before report, saved with CreateNew. Report formatting failure keeps native exit and separate error type. Metadata log requires sensitive/unexpected object review before C2C release; no password log. Native stderr remains in user terminal, not automatically dumped into C2C. No exit means failure, never fabricate0.

## Offline verification actually executed

Windows user child Start-Process, mock cmd exit only, no psql/network/database. Cases: success0, connectionfailure2, SQLfailure3, reportfailure3, stderr+exit2 preserved, hash mismatch41 before native, no-mode40 before native. Process exits and saved .exit.txt match in five native cases. Logs m-test-*.stdout/stderr.log and unique m-offline-* folders. New GUID outputs separate invocations; report failure folder contains report-error and native.exit, not fabricated success JSON. These are wrapper proofs, not SQL syntax/runtime or DB evidence.

## F split / fail-closed design

Retired combined auth-evidence-definitions-draft.sql contains only HALT/error, no raw reads. Independent drafts:
- auth-evidence-f-function-draft.sql: only observed zero-arg signup function; prerequisite exact count=1, body hash, owner/security/search_path and exact expected enabled trigger binding plus no additional Auth handler. Metadata gate runs before definition. Mismatch causes read-only intentional SQL error under ON_ERROR_STOP, not zero-row continuation. Private quarantine flag hard-disabled pending separately reviewed human collector.
- auth-evidence-f-policy-draft.sql: no expression SELECT yet. Hard-disabled until M yields approved exact policy/role/command/USING/CHECK manifest and count/hash preflight. No invented fingerprint. Independent quarantine/approval required. Not execution-ready.

Private quarantine requirements: confirm local path outside workspace AND every C2C read root, least user access, no auto-sync/share/C2C record/captured Codex terminal/raw screenshot. Collector must be independently prepared and review-tested; a manually supplied flag alone does not verify quarantine. Human first-inspects raw; release only sanitized logic with original fingerprint and separate sanitized artifact hash, redactions marked. No automated regex assurance that raw is secret-free. If safe quarantine not proven or secrets/sensitive literals possible without human check, STOP. No raw acquisition/release approved now.

F-function approval never grants F-policy; M never grants either. No row/count/provenance classification or retention implementation. Preserve SET NULL; forbid Auth hard-delete. Any new function/policy dependency requires new allowlist/scope review, no arbitrary body traversal.

## Approval and STOP

Human request: approve only M metadata catalog script and wrapper on named test project, local password/TLSverify-full; report exact exit and sanitized metadata then STOP. No definitions/user rows/counts/additional SQL/migrations/fixtures/DB repairs/Git mutations/deploy/AuthLIVE. No F approval bundled.

STOP on identity/TLS/hash/auth/SQL/privilege error, missing objects/unknown dependencies or unexpected output. Do not auto repair/retry or reinterpret partial results as migration-ready.
HEAD96f4be8575718d50eab2285ab5241d1583f3423a and indexSHA2562CCEC39D9D69A39044F41840197966E9D329EC3DEF5935BF7372CE342253888A preserved. No 006/007/app edits. Only offline wrapper/drafts/docs/mock evidence changed.
NEXT_EXPECTED_STEP: STOP for ChatGPT/human approval.

ChatGPT review received: AUTH_EVIDENCE_M_HUMAN_APPROVAL_PENDING; M_OFFLINE_REVIEW PASS; M_DATABASE_EXECUTION NOT APPROVED. F-function/F-policy NOT APPROVED; quarantine flags may not be manually unlocked. Wait explicit human M approval, then verify workspace/TLS and execute exact reviewed script once, no retry. This preparation stopped with no DB access.
