-- OFFLINE DISABLED DRAFT: role ONLY. No live execution or raw release approval.
-- Private collector/quarantine must be implemented and separately approved first.
\set ON_ERROR_STOP on
\set private_collection_authorized false
\if :private_collection_authorized
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL statement_timeout='20s';
SET LOCAL lock_timeout='2s';
SELECT (count(*)=1 AND coalesce(bool_and(
 p.oid=17844 AND pg_get_function_identity_arguments(p.oid)=''
 AND pg_get_userbyid(p.proowner)='postgres' AND p.prosecdef
 AND p.provolatile='s' AND p.prokind='f'
 AND format_type(p.prorettype,NULL)='text'
 AND p.proconfig=ARRAY['search_path=""']
 AND md5(p.prosrc)='122b1309e6548a8dcfd4ce30be1e2de8' AND md5(pg_get_functiondef(p.oid))='c2554d154ec5de15887e8a17a07713a3' AND l.lanname='sql'
  AND EXISTS (SELECT 1 FROM pg_depend d JOIN pg_policy pol ON pol.oid=d.objid JOIN pg_class c ON c.oid=pol.polrelid JOIN pg_namespace ns ON ns.oid=c.relnamespace WHERE d.classid='pg_policy'::regclass AND d.refclassid='pg_proc'::regclass AND d.refobjid=p.oid AND ns.nspname='public' AND c.relname='shifts' AND pol.polname='st_auth_shifts_create' AND md5(coalesce(pg_get_expr(pol.polqual,pol.polrelid),''))='d41d8cd98f00b204e9800998ecf8427e' AND md5(coalesce(pg_get_expr(pol.polwithcheck,pol.polrelid),''))='d4d6af0b2dfe8a2e050f0d6064df33e0')),false)) AS function_gate
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace JOIN pg_language l ON l.oid=p.prolang WHERE n.nspname='public' AND p.proname='st_auth_role' AND p.pronargs=0
\gset
\if :function_gate
-- Output MUST be private human-only; never stdout captured by Codex/C2C.
SELECT p.oid,md5(p.prosrc) AS body_hash,pg_get_functiondef(p.oid) AS private_definition
FROM pg_proc p WHERE p.oid=17844 AND md5(p.prosrc)='122b1309e6548a8dcfd4ce30be1e2de8';
COMMIT;
\else
\echo HALT: function identity/fingerprint/binding mismatch
SELECT 1/0;
\endif
\else
\echo HALT: private collection authorization and quarantine not implemented
SELECT 1/0;
\endif