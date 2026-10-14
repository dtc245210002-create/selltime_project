-- OFFLINE DISABLED DRAFT: protection ONLY. No live execution or raw release approval.
-- Private collector/quarantine must be implemented and separately approved first.
\set ON_ERROR_STOP on
\set private_collection_authorized false
\if :private_collection_authorized
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL statement_timeout='20s';
SET LOCAL lock_timeout='2s';
SELECT (count(*)=1 AND coalesce(bool_and(
 p.oid=17849 AND pg_get_function_identity_arguments(p.oid)=''
 AND pg_get_userbyid(p.proowner)='postgres' AND NOT p.prosecdef
 AND p.provolatile='v' AND p.prokind='f'
 AND format_type(p.prorettype,NULL)='trigger'
 AND p.proconfig=ARRAY['search_path=""']
 AND md5(p.prosrc)='4226f087fc497ad3d0bd862ec0178e6f' AND md5(pg_get_functiondef(p.oid))='0e30b09fa59118a102bf824285dc3148' AND l.lanname='plpgsql'
  AND EXISTS (SELECT 1 FROM pg_trigger t WHERE t.tgrelid=to_regclass('public.users') AND NOT t.tgisinternal AND t.tgname='st_auth_immutable_account' AND t.tgfoid=p.oid AND t.tgtype=19 AND t.tgenabled='O')),false)) AS function_gate
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace JOIN pg_language l ON l.oid=p.prolang WHERE n.nspname='public' AND p.proname='st_auth_immutable_account' AND p.pronargs=0
\gset
\if :function_gate
-- Output MUST be private human-only; never stdout captured by Codex/C2C.
SELECT p.oid,md5(p.prosrc) AS body_hash,pg_get_functiondef(p.oid) AS private_definition
FROM pg_proc p WHERE p.oid=17849 AND md5(p.prosrc)='4226f087fc497ad3d0bd862ec0178e6f';
COMMIT;
\else
\echo HALT: function identity/fingerprint/binding mismatch
SELECT 1/0;
\endif
\else
\echo HALT: private collection authorization and quarantine not implemented
SELECT 1/0;
\endif