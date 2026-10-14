# M metadata execution evidence

Task c2c_a73f, Iteration 6, workspace selltime_project / e9c367fdc841.

Approved SQL SHA256: 9D3279B0683C8F7BABF972849934A3CE58219DE6B4ED4E748E234BFFB1EACD42.
Evidence folder: m-executed-20261013T175327042-78457c22fbab446c8d4fef5c4f7ae0a1.
Saved native.exit.txt and status.json both report native exit 0, OfflineTest false, matching approved SQL hash. User supplied terminal output reports COMMIT and EXACT_NATIVE_EXIT=0. No rerun was performed during evidence review.

TLS: previously verified CA and hostname with verify-full; approved wrapper enforces verify-full. Database output confirms TLSv1.3 / TLS_AES_256_GCM_SHA384, PostgreSQL 17.6. TLS catalog output alone does not prove client hostname verification.

## Sanitized metadata findings

- Eight scoped application tables have RLS enabled; FORCE RLS is false. Execution as postgres is catalog collection, not a behavioral RLS test.
- Eleven policies were observed; only expression hashes were collected. Policy names do not establish ownership safety.
- Signup trigger st_auth_identity_created is enabled and bound to public.st_auth_new_identity, SECURITY DEFINER, empty search path, body hash 5f763cd39b9b47c3219d37daaef72c96. An additional users trigger st_auth_immutable_account is enabled, SECURITY INVOKER, empty search path, hash 4226f087fc497ad3d0bd862ec0178e6f. Definitions remain unexamined.
- The fixed helper allowlist returns only st_auth_new_identity; no expected 006 helpers/RPC appear in that result. All three sampled app roles lack EXECUTE on this trigger function; this does not establish trigger execution failure.
- Authenticated has SELECT on scoped user/profile/conversation/application tables, SELECT/INSERT on shifts, SELECT/INSERT/DELETE on messages. Anon has shifts SELECT only. Neither role has users column INSERT/UPDATE privileges. Escrow grants are absent for sampled roles.
- Fourteen FK edges were observed. Auth binding retains ON DELETE SET NULL. Profile and shift ownership edges include CASCADE; conversations and message sender edges include NO ACTION; escrow references use SET NULL. Auth hard-delete remains forbidden.
- Users schema has nullable auth_user_id but required id/email/phone/full_name/role. No detached-user provenance classification is established by this metadata. Global users_email_key remains present.
- Policy dependency metadata references function OIDs 17843/17844 not resolved by the approved helper allowlist. No extra lookup was performed. Direct catalog dependencies do not prove transitive or dynamic-SQL behavior.

## Scope and remaining gates

Reviewed pasted output contains catalog metadata/hashes only; no passwords, tokens, user records/counts, function bodies, or policy expressions. Original catalog evidence is local. No F execution, additional SQL, migrations, fixtures, DB repairs, provider signup, deploy, or Auth LIVE occurred during this review.

HEAD remains 96f4be8575718d50eab2285ab5241d1583f3423a. Dirty user work and staged credential deletion are preserved; only this evidence summary was added by this review. Iteration 6 remains in-review. F-function and F-policy need independent human approval; migration and behavioral integration are not approved.

STATE: AUTH_EVIDENCE_M_EXECUTED. NEXT_EXPECTED_STEP: STOP for ChatGPT review.

## ChatGPT review returned

STATE: AUTH_EVIDENCE_M_ACCEPTED. M execution accepted; native exit 0 and read-only COMMIT confirmed through the selltime_project connector. Reconciliation remains blocked; Iteration 6 remains in-review.

Suggested next checkpoint is offline preparation of a narrowly scoped dependency-identification metadata request covering st_auth_immutable_account and unresolved function OIDs 17843/17844, including fingerprints, wrapper/hash and STOP gates. This suggestion is not permission for additional database queries. F-function, F-policy, migration, and Auth LIVE remain unapproved. No next-checkpoint work was executed in this evidence-review task.
