# Auth function evidence request — offline preparation

Task c2c_a73f / Iteration 6 / selltime_project / e9c367fdc841.
STATE: AUTH_FUNCTION_EVIDENCE_REQUEST_READY.
All acquisition/execution/release permissions remain NOT GRANTED.

## Exact scope and source evidence

Use auth-function-evidence-manifest.json for the exact four zero-argument identities and original body fingerprints from accepted M/dependency metadata. Original body hashes are observations, not proof of semantics. The signup function's full-definition fingerprint and language were not acquired; they are explicitly unknown, not guessed. Three other definition fingerprints are known. Original definition/body MD5 values identify continuity only, not cryptographic integrity; SHA256 locks local SQL drafts separately in auth-function-draft-hashes.json.

Four independent disabled drafts: auth-function-signup-private-draft.sql, auth-function-ownership-private-draft.sql, auth-function-role-private-draft.sql, auth-function-protection-private-draft.sql. Approval of one function never authorizes the other three. Prior single-signup F draft and F-policy draft remain inactive and are not replaced or enabled. No function execution is proposed: only catalog definition acquisition under a future approval.

## Per-function gates and STOP conditions

Each draft begins with a hard false private_collection_authorized gate. It cannot be enabled through a psql -v override because the script sets it false. Do not manually toggle it. A reviewed executable derivative and new immutable hash require a later checkpoint.

The hypothetical branch requires READ ONLY / REPEATABLE READ and timeouts. It verifies exactly one named zero-argument function, observed OID, owner, security mode, volatility, return type, empty search_path and body hash. Known full-definition hashes and verified languages are additionally checked. Signup verifies its known enabled trigger/type/table and exactly one noninternal auth.users trigger. Protection verifies its known enabled trigger/type/public.users binding. Ownership/role verify their direct shifts_create policy dependency and M expression hashes. These bounded checks do not establish all trigger/policy/ACL continuity or transitive/dynamic-SQL equivalence. Collector must compare captured source fingerprint again and withhold release on any mismatch; concurrent DDL remains a risk requiring review before executable derivative approval.

STOP before acquisition on wrong workspace/project/endpoint, missing separate per-function approval, unknown quarantine isolation, hash mismatch, missing/changed function, binding drift, TLS/auth/SQL error or excess output. No retry, repair, different-function fallback or dependency traversal. Returned zero definitions is failure, not a successful empty result. Catalog counts are permitted only for bounded objects; no user rows/counts.

## Private quarantine design — not yet created or verified

Candidate: a new human-owned local directory under C:/Users/admin/AppData/Local/SellTimeAuthEvidencePrivate, outside OneDrive, workspace and current writable runtime. This is a proposed path only. Being outside workspace is NOT enough to establish exclusion from C2C or privacy. Before collection, independently verify effective connector read roots/path validation, absence of symlinks/junctions/reparse points, cloud sync/indexing/export, and existing Windows ACL access. Collector preparation must fail closed if those checks are inconclusive. No ACL or connector permission change is authorized in this task.

If private isolation cannot be established using existing supported boundaries, STOP and request a separately approved private destination or human-provided sanitized source. Codex must not use generic shell/file/browser tools to read raw quarantine, even if OS permissions technically permit it. No screenshots, stdout echo, C2C indexing, auto-upload or raw file copy. No root listing/file-content discovery in unrelated user directories.

## Collector separation and output contract

Actual live collector is NOT implemented. Its required design: fixed approved test endpoint/CA/TLS verify-full and SQL hash; user Windows password prompt only; one function per explicitly approved attempt; private output file opened CreateNew; raw stdout redirected into private quarantine before process launch; stderr/errors treated as possibly containing source or literals and kept private too. Never use -a/-e, workspace -L logging, shell transcript, terminal piping that echoes raw, or captured Codex exec streams for definitions. Password entry must remain interactive and separate from stdout/stderr redirection; prove that arrangement using synthetic mocks before a live collector is eligible.

Public evidence may include function identity, native exit, approved draft SHA256, original function fingerprints, per-function approval reference, collection timestamp/project and release state only. Private path/file names must not encode source, personal data or credentials. Bound output size and terminate on overflow; partial/error output remains quarantined and unreleased. Save native exit before reporting; reporting failure must preserve it. No automatic retry. SQL drafts are disabled and must never be run with existing metadata wrappers, whose logs are C2C-readable.

## Human-first sanitization and separate release

Human first inspects local raw definition in their own editor. Remove credentials, embedded personal/user values, connection secrets and unrelated content; annotate redactions without reproducing sensitive values. Pattern scanners are secondary checks, never proof of sanitization. This task does not create a scanner capable of authorizing release.

Human separately authorizes the sanitized derivative for BOTH Codex and ChatGPT review. Only then may that derivative enter a C2C-readable workspace artifact. Record original body/definition fingerprint separately from sanitized derivative SHA256; sanitization changes bytes. Never claim sanitized content matches the original hash. Redactions affecting identity/role/ownership/error logic block conclusions and require more approved evidence. Suspected secret stays private; revocation is another scope, not automatic.

## Offline mock coverage and limits

test-auth-function-collector-offline.ps1 is a simulator, not a live collector. It has no psql/network/password/ACL/raw-release path. Mock output folders inside workspace contain synthetic placeholders only; they are NOT private quarantine. Test missing live gate, missing per-function approval, missing quarantine, fingerprint drift, native exits 0/2/3 and report failure preserving exit. Hash checks cover the local disabled draft, but a mutable manifest is not an authorization source; execution approval must bind exact external expected hashes.

These mocks do not verify SQL syntax in PostgreSQL, production collector I/O isolation, actual private ACLs/connector exclusion, or sanitization. All remain explicit execution-readiness blockers.

Actual mock run: 11/11 PASS. Covered live-disabled exit 40, missing independent approval 40, unknown quarantine 43, fingerprint drift 41, all four selected synthetic successes 0, native authentication error 2, native SQL error 3 and report error retaining saved native 3. Results: auth-function-offline-mock-results.json and function-mock-test-*.log. Only OS command-processor exit mocks were invoked. No real private directory was created and no real definition was acquired.

Changed artifacts in this task: this request, auth-function-evidence-manifest.json, auth-function-draft-hashes.json, four new disabled auth-function-*-private-draft.sql files, offline simulator and synthetic result/log folders. Prior M/dependency scripts and old F drafts were preserved. TypeScript/regression/build were not run because no application code changed; verification is limited to offline evidence preparation.

## Independent approval sequence

1. ChatGPT reviews this offline packet and mock results.
2. Prepare/review a real private collector and verify quarantine isolation without reading raw definitions. Any directory/ACL/connector change needs separately scoped permission.
3. Human explicitly authorizes one function acquisition with exact executable SQL/collector hashes and verified private destination. Future raw collection scope must specify human-only recipient.
4. Human sanitizes privately; separate human release approval identifies the exact derivative/destination.
5. Codex and ChatGPT review only released artifacts. F-policy, migration, fixtures, repairs, RLS behavioral tests and LIVE stay independent.

Approach A, preserve FK SET NULL and no Auth hard-delete remain mandatory. Preserve user dirty work, staged deletions, HEAD and index. No app code/006/007 changes in this preparation. STOP for review, before any database or raw acquisition.

## ChatGPT review received

AUTH_FUNCTION_EVIDENCE_REQUEST_REVIEWED: offline design accepted for collector preparation; mock tests 11/11 accepted per evidence. RAW ACQUISITION and DATABASE EXECUTION remain NOT APPROVED.

Returned next checkpoint: PREPARE_PRIVATE_FUNCTION_COLLECTOR, offline/synthetic only. Requirements: human-only private output isolation, exact function/SQL hashes, stdout/stderr isolation, bounded output, CreateNew, native exit preservation, no retries, separate approval per function. Prioritize st_auth_new_identity(). Quarantine isolation, a real collector, and sufficient signup fingerprints remain unresolved. No database approval is requested at this stage; a separate future per-function acquisition request must follow collector/quarantine review.

This task stops after recording that review. HEAD 96f4be8575718d50eab2285ab5241d1583f3423a and Git index SHA256 2CCEC39D9D69A39044F41840197966E9D329EC3DEF5935BF7372CE342253888A were rechecked unchanged. No source edits, Git mutations, credential access, DB queries or raw definitions occurred.
