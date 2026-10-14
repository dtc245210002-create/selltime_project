[C2C]
STATE: PREFLIGHT_BLOCKED
TASK_ID: c2c_a73f
ITERATION: 6
WORKSPACE: selltime_project / e9c367fdc841
TEST_PROJECT_REF: dauglhucpflemfdsygzr

Execution used the reviewed db-preflight-readonly.sql. SHA256 remains B991BBCBD24CF48F48D62D0EB96CBF8DF62B759784B787198518754356B55FFA. No rerun or further database query during evidence review.

Connectivity/TLS: independent IPv4 TCP/PostgreSQL TLS handshake exit 0; CA and hostname verified. Psql connection log shows ssl=true, TLSv1.3, TLS_AES_256_GCM_SHA384. Database postgres; current/session role postgres; PostgreSQL 17.6 UTF8. Endpoint/user match the human-supplied test connection, but SQL metadata cannot independently prove dashboard project identity.

SQL log contains all reviewed SELECT results and ends with COMMIT. It does not contain a SQL error. Psql exact process exit code was not retained: wrapper status contains ExitCode=1, ErrorType=CommandNotFoundException after SQL completed. Treat this as an evidence-reporting failure, not a proven SQL failure or exit 0. Missing command is not identified from the status file; no auto retry or database change.

Catalog: all 10 expected auth/public relations exist, RLS enabled. public.users email varchar(120) NOT NULL, auth_user_id nullable uuid, role user_role NOT NULL, id varchar(50) NOT NULL.

Protected-column ACL: anon has no SELECT/INSERT/UPDATE on the five sampled fields; authenticated SELECT=true, INSERT/UPDATE=false on email/role/kyc_id_number/is_kyc_verified/auth_user_id. No explicit column ACL on sampled fields. This is catalog evidence only, not cross-user RLS integration proof.

Roles anon/authenticated/supabase_auth_admin: rolsuper=false, rolbypassrls=false. public.users policy st_auth_users_own is permissive SELECT. This preflight did not read policy expressions or user rows.

Offline fingerprint comparison:
- users_email_key definition hash cb128631a72269d9e93b234b2814eb06 matches UNIQUE (email).
- users_pkey hash 4c6419b3704337bbfe50f018842a9ad3 matches PRIMARY KEY (id).
- st_auth_users_identity_unique hash 3939596b6b0eb0c3a60cbfda6e98ad0c matches UNIQUE (auth_user_id).
- FK st_auth_users_identity_fk hash f91277b3e8169a1b117532ba0a21d069 does NOT match the locally calculated expected textual ON DELETE CASCADE definition (58321cb48921009baca4009f75fcf1f6). Textual rendering may differ; FK semantics are unverified, not asserted broken. No raw definition query was run.
- Three valid/ready unique indexes reported; exact index fingerprints remain unverified against runtime-rendered expected definitions.

STOP findings:
1. Exact expected trigger selltime_auth_signup query returned 0 rows. Migration 006/007 require it. Other trigger names/body/owner are not inspected by this approved script; cannot conclude all signup triggers absent. No trigger body fingerprint available.
2. Email default collation recorded collversion=NULL, actual version=153.121, deterministic=true. As written, 007 uses IS DISTINCT FROM and would HALT on this metadata. Do not loosen the guard or alter database collation automatically; requires design review.
3. Email dependency count contains one pg_constraint dependency; count alone does not prove every dependency is safe.
4. Wrapper failed to preserve exact psql exit code.

Unicode results describe literal lower(default) only; no provider normalization parity claim. SQL/provider/RLS integration, migration, fixtures, user-row queries and cleanup NOT RUN.

Security/preservation: password entered by human locally, never supplied to Codex/chat or persisted by wrapper. No credential files read. No application-source edit, database mutation, Git mutation or deployment. HEAD 96f4be8575718d50eab2285ab5241d1583f3423a and index SHA256 2CCEC39D9D69A39044F41840197966E9D329EC3DEF5935BF7372CE342253888A preserved.

Evidence: db-preflight-20261013.log, db-preflight-20261013-status.json; check-pooler-tls.py and run-reviewed-preflight.ps1. Reports/supporting scripts only changed locally.
NEXT_EXPECTED_STEP: STOP for ChatGPT review; no automatic migration approval.

ChatGPT review received in the existing C2C conversation: PREFLIGHT_VERDICT=PARTIAL_PASS_BLOCKED; TLS=PASS; CATALOG_QUERY_COMPLETION=OBSERVED_COMMIT; EXACT_PSQL_EXIT=UNKNOWN; WRAPPER_EXIT=1. B1 trigger, B2 collation and B3 FK semantics remain unresolved. Next checkpoint is preparation of DB_DIAGNOSTIC_READ_ONLY_REQUEST for human approval. No database queries until new explicit authorization. Iteration 6 remains in-review.
