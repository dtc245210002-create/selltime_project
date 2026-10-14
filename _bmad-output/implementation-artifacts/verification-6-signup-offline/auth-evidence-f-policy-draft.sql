-- OFFLINE F-POLICY TEMPLATE ONLY. Independent from F-function.
-- Policy name/role/command/USING/CHECK fingerprints must come from approved M.
-- Until exact manifest and private quarantine checks are approved, raw output is disabled.
\set ON_ERROR_STOP on
\set policy_manifest_and_quarantine_verified false
\if :policy_manifest_and_quarantine_verified
BEGIN READ ONLY;
SET LOCAL statement_timeout='20s';
SET LOCAL lock_timeout='2s';
-- The runtime manifest/count/hash gate is intentionally NOT yet specified:
-- M has not run, so there is no approved expected policy inventory to freeze.
-- Never bypass this HALT to enumerate expressions.
SELECT 1/0;
COMMIT;
\else
\echo HALT policy manifest/quarantine not prepared or approved; no raw output
SELECT 1/0;
\endif
