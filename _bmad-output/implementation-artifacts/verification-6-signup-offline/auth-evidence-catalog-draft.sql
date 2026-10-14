-- OFFLINE DRAFT: NOT APPROVED TO RUN. M scope: metadata/hashes only.
\set ON_ERROR_STOP on
BEGIN READ ONLY;
SET LOCAL statement_timeout='20s';
SET LOCAL lock_timeout='2s';
SELECT current_database(),current_user,current_setting('server_version');
SELECT ssl,version,cipher FROM pg_stat_ssl WHERE pid=pg_backend_pid();
-- M1: bounded relation scope, including force-RLS and ownership.
SELECT c.oid,c.relname,c.relkind,c.relrowsecurity,c.relforcerowsecurity,
  pg_get_userbyid(c.relowner) AS owner
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relname IN ('users','candidate_profiles','employer_profiles',
  'shifts','shift_applications','conversations','messages','escrow_transactions') ORDER BY c.relname;
-- M2: trigger binding/hash; arguments/body excluded.
SELECT t.tgname,t.tgenabled,t.tgtype,p.oid AS function_oid,n.nspname,p.proname,
  pg_get_function_identity_arguments(p.oid) AS signature,p.prosecdef,
  p.proconfig=ARRAY['search_path=""'] AS empty_search_path,
  pg_get_userbyid(p.proowner) AS owner,md5(p.prosrc) AS body_hash
FROM pg_trigger t JOIN pg_proc p ON p.oid=t.tgfoid JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE NOT t.tgisinternal AND t.tgrelid IN (to_regclass('auth.users'),to_regclass('public.users'));
-- M3: policy hash and role identities, not policy literals/expressions.
SELECT c.relname,p.polname,p.polcmd,p.polpermissive,
  ARRAY(SELECT CASE WHEN r=0 THEN 'PUBLIC' ELSE pg_get_userbyid(r) END FROM unnest(p.polroles) r) AS roles,
  md5(coalesce(pg_get_expr(p.polqual,p.polrelid),'')) AS using_hash,
  md5(coalesce(pg_get_expr(p.polwithcheck,p.polrelid),'')) AS check_hash
FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relname IN ('users','candidate_profiles','employer_profiles',
  'shifts','shift_applications','conversations','messages','escrow_transactions');
-- M4: effective table/column privileges for bounded application roles.
SELECT r.rolname,c.relname,has_table_privilege(r.oid,c.oid,'SELECT') AS sel,
  has_table_privilege(r.oid,c.oid,'INSERT') AS ins,
  has_table_privilege(r.oid,c.oid,'UPDATE') AS upd,
  has_table_privilege(r.oid,c.oid,'DELETE') AS del
FROM pg_roles r CROSS JOIN pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE r.rolname IN ('anon','authenticated','supabase_auth_admin') AND n.nspname='public'
  AND c.relname IN ('users','candidate_profiles','employer_profiles','shifts','shift_applications',
    'conversations','messages','escrow_transactions');
SELECT r.rolname,a.attname,has_column_privilege(r.oid,a.attrelid,a.attnum,'SELECT') AS sel,
  has_column_privilege(r.oid,a.attrelid,a.attnum,'INSERT') AS ins,
  has_column_privilege(r.oid,a.attrelid,a.attnum,'UPDATE') AS upd
FROM pg_roles r CROSS JOIN pg_attribute a WHERE r.rolname IN ('anon','authenticated')
  AND a.attrelid=to_regclass('public.users') AND a.attnum>0 AND NOT a.attisdropped;
-- M5: explicit local-contract/helper allowlist; no arbitrary function traversal.
SELECT p.oid,n.nspname,p.proname,pg_get_function_identity_arguments(p.oid) AS signature,
  p.prosecdef,p.provolatile,p.prorettype::regtype AS return_type,
  pg_get_userbyid(p.proowner) AS owner,md5(p.prosrc) AS body_hash,
  r.rolname,has_function_privilege(r.oid,p.oid,'EXECUTE') AS can_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace CROSS JOIN pg_roles r
WHERE n.nspname='public' AND r.rolname IN ('anon','authenticated','supabase_auth_admin')
  AND p.proname IN ('st_auth_new_identity','handle_auth_signup','current_app_user_id','current_app_role',
    'set_employer_role','is_conversation_member','owns_shift','applied_to_shift');
-- M6: inbound/outbound FK graph touching bounded application tables; no data.
SELECT c.conname,c.conrelid::regclass AS source,c.confrelid::regclass AS target,
  c.convalidated,c.condeferrable,c.confdeltype,c.confupdtype,
  ARRAY(SELECT a.attname FROM unnest(c.conkey) WITH ORDINALITY k(num,seq)
    JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=k.num ORDER BY seq) AS source_columns,
  ARRAY(SELECT a.attname FROM unnest(c.confkey) WITH ORDINALITY k(num,seq)
    JOIN pg_attribute a ON a.attrelid=c.confrelid AND a.attnum=k.num ORDER BY seq) AS target_columns
FROM pg_constraint c WHERE c.contype='f' AND (c.conrelid IN
  (SELECT t.oid FROM pg_class t JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public'
    AND t.relname IN ('users','candidate_profiles','employer_profiles','shifts','shift_applications',
      'conversations','messages','escrow_transactions')) OR c.confrelid=to_regclass('public.users'));
-- M7: provenance structure only, no row/count/default/check expression output.
SELECT a.attname,format_type(a.atttypid,a.atttypmod) AS type,a.attnotnull,
  a.attidentity,a.attgenerated,a.atthasdef
FROM pg_attribute a WHERE a.attrelid=to_regclass('public.users') AND a.attnum>0 AND NOT a.attisdropped;
SELECT conname,contype,convalidated,md5(pg_get_constraintdef(oid)) AS definition_hash
FROM pg_constraint WHERE conrelid=to_regclass('public.users');
-- M8: direct function/policy dependencies, object identities only; not full semantic proof.
SELECT d.classid::regclass AS dependent_catalog,d.objid,d.objsubid,d.deptype,
  d.refclassid::regclass AS referenced_catalog,d.refobjid,d.refobjsubid
FROM pg_depend d WHERE
  (d.classid='pg_policy'::regclass AND d.objid IN
    (SELECT p.oid FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relname IN ('users','candidate_profiles','employer_profiles','shifts',
        'shift_applications','conversations','messages','escrow_transactions')))
  OR (d.classid='pg_proc'::regclass AND d.objid IN
    (SELECT p.oid FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
      WHERE n.nspname='public' AND p.proname IN ('st_auth_new_identity','handle_auth_signup',
        'current_app_user_id','current_app_role','set_employer_role','is_conversation_member','owns_shift','applied_to_shift')));
COMMIT;
