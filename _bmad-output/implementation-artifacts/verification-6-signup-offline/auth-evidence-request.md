[C2C]
STATE: AUTH_EVIDENCE_REQUEST_READY
TASK_ID: c2c_a73f
ITERATION: 6
WORKSPACE: selltime_project / e9c367fdc841
TEST_PROJECT_REF: dauglhucpflemfdsygzr
STATUS: OFFLINE REQUEST — NO DATABASE ACCESS APPROVED

## Purpose / fixed boundaries

Approach A targets Auth/RLS contract006, with preserve SET NULL and no Auth hard-delete. Acquire missing evidence before any reconciliation implementation. This request does not reopen prior metadata approvals; neither draft SQL was run. No user rows/counts, signup, fixtures, writes, secrets, Git mutation, deploy or LIVE.

Connection if separately approved: only test ref dauglhucpflemfdsygzr; Session Pooler aws-0-ap-northeast-1.pooler.supabase.com:5432; postgres.dauglhucpflemfdsygzr / postgres; TLS verify-full with public CA C:/Users/admin/Downloads/prod-ca-2021.crt. Identity/TLS verified again; local interactive password. No connection string password, PGPASSWORD, credential discovery or logging. Wrapper must have exact exit capture tested offline, fixed approved SQL path/hash and new output filenames, no automatic rerun.

## M — Metadata approval request

Draft: auth-evidence-catalog-draft.sql. READ ONLY transaction/timeouts, fixed relation/function/role allowlists. No function body, trigger args, arbitrary proconfig, policy literal/default/check expression or user data emitted.

| Query | Why / expected output | Interpretation limit |
|---|---|---|
| M1 | Eight application relations: RLS/forceRLS/owner | Flags alone not authorization proof |
| M2 | auth.users/public.users noninternal trigger bindings, signatures, owner/search_path flag/body hashes | Unexpected handler/function needs new scope, never auto-enumerate source |
| M3 | Fixed-table policy names/commands/roles and USING/CHECK hashes | Expressions require F scope; fingerprints identify drift, not semantics |
| M4 | Effective table privileges for three app roles and users column privileges for anon/authenticated | Includes inherited role effects via privilege API; not exhaustive role membership or all-column ACL inventory |
| M5 | Contract allowlisted helper/RPC metadata and effective EXECUTE | Missing/different signatures HALT; unknown functions need separate allowlist review |
| M6 | Application FK deletion/update graph, including inbound references to users | Catalog graph, not deletion test; SET NULL must remain, no CASCADE conversion |
| M7 | users column/type/default-presence/constraint hashes | May identify a provenance mechanism; cannot identify/classify rows or prove no detached users |
| M8 | Direct catalog dependency IDs for bounded policies/functions | SQL-language body references may not be tracked; transitive/dynamic SQL dependencies remain unknown |

No dependency closure queries automatically generated from output. OIDs are environment-specific; map unknown referenced object via new reviewed scope or trusted migration source. Metadata beyond allowlist is a blocker, not broad read permission.

## F — Controlled definition acquisition, separate approval

Draft: auth-evidence-definitions-draft.sql. This contains raw function/policy definitions and is NOT part of M approval. F-function is only st_auth_new_identity() zero args, trigger return and observed prosrc MD5 match; F-policy is only policies on fixed eight tables. No other helper bodies by implicit dependency traversal. Fingerprint drift/zero rows → STOP before source release.

Preferred alternative: human supplies sanitized existing migration/source with provenance and observed fingerprint verification; no DB source query needed. A sanitized definition cannot retain an original byte-for-byte fingerprint, so separately label original hash and sanitized artifact SHA256; never claim they are identical.

Collection plan if explicitly approved: human-controlled psql execution saves raw output in a private local quarantine OUTSIDE workspace and OUTSIDE C2C read roots. Do not auto-create/upload/record raw into C2C, screenshot raw or output raw to a captured Codex terminal. Human is the first reviewer; Codex/ChatGPT do not read raw under this request. If quarantine cannot be confirmed excluded from connector before collection, STOP. No collector/sanitizer or F execution wrapper implemented in this offline scope.

Sanitization/release plan: human removes credential values, endpoints with embedded secrets, personal/email literals, embedded datasets and unrelated function/settings content. Retain only approved business SQL logic/signatures/role checks/binding/profile/exception paths needed for analysis, annotate redactions and unknowns. Pattern scanning is a secondary check, never proof no secrets; manual review required. Suspected secret → withhold release, do not print it. Secret rotation/removal is outside this scope.

Human explicitly approves the sanitized artifact for Codex and ChatGPT review before a copy enters MCP-visible workspace. Record query hash, collection timestamp/project, original function hash, sanitized artifact hash and redaction categories without secret values. If redaction changes load-bearing logic or removes needed dependencies, mark unresolved, do not invent semantics. Metadata/body hash cannot authorize replacing trigger.

## B3 provenance / no data approval

Schema only: list structural columns/constraint fingerprints. Do not SELECT users rows, emails, COUNT(*), grouped counts, sample records, Auth data or classify null bindings. Provenance columns absent/ambiguous → block data migration readiness; request separately scoped aggregation/source evidence later. No hard-delete even in tests; preserve SET NULL. No create provenance column in this request.

## STOP and acceptance

STOP on identity/endpoint/TLS/auth mismatch, SQL/privilege error, unknown schema/function/policy/dependency, function hash drift, output overflow/unexpected embedded sensitive content or missing quarantine/release approval. Capture exact native exit; separate reporting failure. No repair/guard relaxation/retry or extra SQL. Missing helper/trigger is evidence, not an instruction to create it.

Accepted evidence pack must distinguish observed metadata, released definition semantics and remaining unknowns; validate server role/owner derivation, exactly-one signup handler, Candidate/KYC=false, no DEMO/email rebind, RPC ACL and policy composition. It is not RLS/signup runtime acceptance or migration approval. SQL drafts not parsed/run in PostgreSQL in this preparation.

## Independent checkpoints to approve

1. M: execute auth-evidence-catalog-draft.sql only, sanitized metadata report then STOP.
2. F-function / F-policy: explicit raw local human collection authorization, identified private quarantine and exact allowlists; separate sanitized release approval to Codex/ChatGPT. M never implies F.
3. User-row/count evidence: NOT REQUESTED here, needs another checkpoint if necessary.
4. Implementation/migration/fixtures/database mutation/LIVE: NOT REQUESTED, require future approvals.

Suggested M approval wording: “Approve only AUTH_EVIDENCE_METADATA_READ_ONLY on dauglhucpflemfdsygzr, exact reviewed catalog draft with local password/TLS verify-full, no body/policy expressions/user rows/counts or mutations. STOP for review.” Do not offer a single blanket M+F approval.

Preservation: only three offline request/draft artifacts added. 006/007/app/spec unchanged. HEAD96f4be8575718d50eab2285ab5241d1583f3423a; indexSHA2562CCEC39D9D69A39044F41840197966E9D329EC3DEF5935BF7372CE342253888A preserved.
NEXT_EXPECTED_STEP: AUTH_EVIDENCE_REQUEST_READY — STOP for ChatGPT review.

## ChatGPT review received

AUTH_EVIDENCE_REVIEW_ACCEPTED_CONDITIONAL. M design PASS, execution not granted; next is offline wrapper/hash/new-output verification before human execution approval. F not execution-ready: current combined F draft must NOT be run, including under approval of only one subset. Split function and policy scripts; enforce independent approvals and metadata-only preflight object count/hash/trigger binding/quarantine checks before ANY raw output. A WHERE hash filter returning zero rows is not a STOP gate. This revision records required changes, not implementation or SQL execution. Codex stopped after receipt; no database permissions inferred.

Follow-up preparation: combined draft retired, independent F-function/F-policy drafts added; both disabled pending quarantine/execution gates. F-policy awaits M fingerprint manifest. M wrapper/hash/output offline checks and approval boundary are specified in auth-evidence-m-execution-request.md. No drafts run against database.
