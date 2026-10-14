# Dependency identification: offline request

Task c2c_a73f / Iteration 6 / selltime_project / e9c367fdc841.
M execution accepted by ChatGPT. This request does not inherit M's exhausted one-attempt database authorization.

## Exact proposed scope

Only metadata of function OIDs 17843, 17844 and public.st_auth_immutable_account() (observed OID 17849), on test project dauglhucpflemfdsygzr. Read schema/name/signature/owner/language/security mode/volatility/return type, hash fingerprints, grants, and direct links from the eight previously scoped tables' policies. No routine invocation, raw body, raw policy expression, rows/counts, or transitive discovery.

SQL: auth-evidence-dependency-metadata-draft.sql.
SHA256: 0DD81E7152E82797ED27738D19B525542313A9888A6DBFAF7661AB0FF668701B.

The draft checks the known immutable-account trigger binding, OID, owner, security mode, empty search path and body hash. Both unknown OIDs must exist and retain a direct scoped policy dependency. OIDs are database-local, not durable identities; their names and hashes remain unknown until explicitly approved acquisition. A matching dependency gate is not semantic equivalence or proof of unchanged unknown function bodies.

## Offline verification and execution wrapper boundary

verify-auth-dependency-offline.ps1 performs only local hash/envelope checks. Without -OfflineCheck it exits 40. It contains no psql invocation or connection code. This check is not a PostgreSQL syntax or behavior test.

A fixed-path execution wrapper is now prepared as run-auth-dependency-metadata.ps1, NOT approved to execute against a database. Its SHA256 is 1339ABF7D238464FAA6E0F2639769D23BEAFB3E7E945623ACFAC4448B698D086. It uses the accepted M pattern: exact hash, no configurable SQL or endpoint, CA/hostname verify-full, fixed test Session Pooler, local interactive password, absent passfile, -X -W and ON_ERROR_STOP, read-only connection default, unique dependency-prefixed output directory, native exit saved before reporting, native stderr preservation, no retries. The original M wrapper and approved M SQL remain unchanged.

Mock tests completed: process and saved native exits 0/2/3 match; reporting failure retains native 3; stderr failure retains native 2; hash mismatch exits 41; missing approval exits 40. All seven cases PASS. Evidence is dependency-offline-test-results.json, dependency-test-*.log and dependency-offline-* folders. No database process was invoked. The -ApprovedExecution flag is a technical gate, not human authorization by itself.

## Output and sanitization

Expect at most three identity records plus bounded grants and policy edges. No record for a requested OID, changed known trigger/fingerprint, unexpected schema/signature/security configuration, inability to obtain catalog privileges, TLS/authentication failure or SQL error means STOP without repair/retry. Review unfamiliar object/grantee names locally before release. Store only sanitized metadata/fingerprints in C2C-readable artifacts; never function bodies, policy expressions, credentials or user data. Do not log password streams or environment values.

The revised SQL explicitly requires exactly three pg_proc catalog objects and compares the complete scoped eleven-policy name/expression-hash manifest from M before releasing function metadata. Added/deleted policies or changed expression hashes HALT. These fingerprints do not include policy role/command/permissive-mode configuration or changes inside referenced helpers; metadata collection is not proof of semantic equivalence. This draft cannot detect all concurrent changes or dynamic SQL dependencies. Definition hashing does not emit raw definitions. No SQL here reads collation or modifies its version.

## Separate approval boundaries

1. Review this offline request/draft; no database authorization.
2. Prepare and mock-test the fixed execution wrapper, then review its immutable hashes and output handling.
3. Human explicitly approves one metadata-only attempt on the exact test project/script/hash/wrapper.
4. Execute, sanitize and STOP for ChatGPT review.
5. F-function and F-policy remain separate future approvals, each requiring fingerprint checks and private quarantine. No implicit approval of migrations, fixtures, repairs, hard-delete, deployment, or Auth LIVE.

HEAD and staged deletions remain preserved. Only new offline artifacts are added. STATE: AUTH_EVIDENCE_DEPENDENCY_IDENTIFICATION_REQUEST_READY. NEXT_EXPECTED_STEP: ChatGPT review, then STOP at the next human approval boundary.

Actual offline checks: Windows sandbox child script launch returned AuthorizationManager/UnauthorizedAccess exit 1 before execution. The same local-only verifier in the user Windows runtime returned -OfflineCheck exit 0 and missing-flag exit 40. No execution policy, sandbox policy, ACL or credential was changed. PostgreSQL syntax is not runtime-validated. HEAD and index hash remain unchanged.

## Consolidated ChatGPT verdict

STATE: DEPENDENCY_HUMAN_APPROVAL_PENDING. OFFLINE_REVIEW: PASS. MOCK_TESTS: 7/7. DATABASE_EXECUTION: NOT APPROVED. ChatGPT reviewed the revised SQL, fixed wrapper and mock evidence via the correct workspace connector. It found no offline scope defect requiring another revision before asking human approval. Policy hashes do not establish full equivalence of command/role/permissive settings. Await explicit human authorization for one exact-script/hash/wrapper attempt on the fixed test project. No next database action has been taken.
