[C2C]
STATE: DIAGNOSTIC_BLOCKED
TASK_ID: c2c_a73f
ITERATION: 6
WORKSPACE: selltime_project / e9c367fdc841
TEST_PROJECT_REF: dauglhucpflemfdsygzr

## Execution evidence

Approved catalog-only script completed BEGIN READ ONLY through COMMIT. Exact psql process exit 0, saved independently in diagnostic-live-20261013T172016357.exit.txt and JSON. SQL SHA256 5005D81279E078347E06E455DCC1B081F02A66FD4853A01E0285E1147BFC43A0. Script unchanged. Log: diagnostic-live-20261013T172016357.log. No additional SQL or rerun.

PostgreSQL 17.6; current database/user postgres. Session ssl=true, TLSv1.3, TLS_AES_256_GCM_SHA384. Independent pre-auth handshake verified supplied CA and pooler hostname. Password entered locally by human, not read/persisted/disclosed by Codex. No user rows or function body dumped.

## B1 — Confirmed target schema differs from local 006/007

auth.users has one noninternal trigger: st_auth_identity_created (enabled O, tgtype 5), calling public.st_auth_new_identity(), owner postgres, SECURITY DEFINER, trigger return type, empty search_path. Body hash 5f763cd39b9b47c3219d37daaef72c96; semantics not proved by hash. Expected selltime_auth_signup absent. Query for public.handle_auth_signup/current_app_user_id/current_app_role/set_employer_role returned zero rows. Do not replace the existing trigger, create another signup trigger, or assume 006 fully applied. A read-only hash/metadata cannot prove the alternative function's behavior.

## B2 — Database version matches; 007 guard still rejects default metadata

pg_database provider i (ICU); datcollversion=153.121 and actual_database_version=153.121. Default/email collation provider d (database default), deterministic true, collversion NULL, actual version 153.121. Therefore no database-level recorded/actual version mismatch observed. This does not prove provider normalization parity. Local 007 currently compares pg_collation.collversion to actual even for provider d, and would HALT. Requires offline design review of default-collation guard semantics; do not refresh/change database collation or loosen guard automatically.

## B3 — Confirmed FK semantics differ

st_auth_users_identity_fk references auth.users(id) from public.users(auth_user_id), validated true, nondeferrable. confdeltype=n is ON DELETE SET NULL, confupdtype=a is NO ACTION, match=s SIMPLE. Local 006/007 expect ON DELETE CASCADE (c). This is a semantic difference, not merely SQL rendering. No deletion/repair performed. Retention/deletion policy must be reviewed before choosing a reconciliation migration.
Reference: https://www.postgresql.org/docs/17/catalog-pg-constraint.html

Three existing unique indexes are valid/ready, not partial, not expression indexes. One sampled email-column dependency: users_email_key constraint on users (deptype a). Diagnostic scope does not constitute exhaustive dependency or RLS integration proof.

## Preservation and verdict

Command execution succeeded, but readiness BLOCKED by B1/B3 schema mismatch and B2 guard compatibility. Migration 000/006/007, fixtures, provider integration, DB repair and Auth LIVE remain unapproved. No application-code edits, DB/Git mutations, credential access or deploy. HEAD=96f4be8575718d50eab2285ab5241d1583f3423a; index SHA256=2CCEC39D9D69A39044F41840197966E9D329EC3DEF5935BF7372CE342253888A unchanged.
Changed files are offline wrapper/supporting logs/report only. Wrapper startup issue identified as Get-FileHash unavailable in child terminal; fixed using .NET SHA256. Child Start-Process mocks 0/2/3 retained exact exits; simulated report failure retained exit 3. Reviewed by ChatGPT before execution.

NEXT_EXPECTED_STEP: STOP for ChatGPT review; no automatic repair or migration.

ChatGPT review received: DIAGNOSTIC_ACCEPTED / MIGRATION_BLOCKED, exact psql exit 0. No diagnostic rerun required. Proposed next checkpoint AUTH_SCHEMA_RECONCILIATION_DESIGN: offline options/risk/test-plan only, with human policy decision for SET NULL vs CASCADE. No implementation, DB queries, migration edits or database execution authorized by this review. Codex stopped after receiving the decision; Iteration 6 remains in-review.
