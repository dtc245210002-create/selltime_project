-- OFFLINE F-FUNCTION DRAFT ONLY. NO EXECUTION/RAW RELEASE APPROVAL.
-- Quarantine preflight must be implemented/reviewed separately; disabled until then.
\set ON_ERROR_STOP on
\set quarantine_verified false
\if :quarantine_verified
BEGIN READ ONLY;
SET LOCAL statement_timeout='20s';
SET LOCAL lock_timeout='2s';
SELECT (count(*)=1 AND bool_and(p.prorettype='trigger'::regtype AND p.prosecdef
  AND p.proconfig=ARRAY['search_path=""'] AND pg_get_userbyid(p.proowner)='postgres'
  AND md5(p.prosrc)='5f763cd39b9b47c3219d37daaef72c96')
  AND (SELECT count(*) FROM pg_trigger t WHERE t.tgrelid=to_regclass('auth.users') AND NOT t.tgisinternal)=1
  AND EXISTS (SELECT 1 FROM pg_trigger t WHERE t.tgrelid=to_regclass('auth.users')
    AND t.tgname='st_auth_identity_created' AND t.tgtype=5 AND t.tgenabled='O'
    AND t.tgfoid=to_regprocedure('public.st_auth_new_identity()') AND NOT t.tgisinternal)) AS ok
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname='st_auth_new_identity' AND p.pronargs=0
\gset function_gate_
\if :function_gate_ok
SELECT md5(p.prosrc) AS original_body_hash,pg_get_functiondef(p.oid) AS PRIVATE_HUMAN_ONLY
FROM pg_proc p WHERE p.oid=to_regprocedure('public.st_auth_new_identity()')
  AND md5(p.prosrc)='5f763cd39b9b47c3219d37daaef72c96';
COMMIT;
\else
\echo HALT function fingerprint/count/binding mismatch
SELECT 1/0;
\endif
\else
\echo HALT quarantine verification not implemented or approved
SELECT 1/0;
\endif
