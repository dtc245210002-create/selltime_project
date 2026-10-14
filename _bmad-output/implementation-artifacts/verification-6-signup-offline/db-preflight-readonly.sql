-- APPROVAL REQUEST ONLY: NOT RUN. Catalog/fixture-literals only; không DDL/DML.
\set ON_ERROR_STOP on
BEGIN READ ONLY;
SET LOCAL statement_timeout = '20s';
SET LOCAL lock_timeout = '2s';
SET LOCAL row_security = off;
SELECT current_database() AS database_name, current_user AS effective_role,
  session_user AS session_role, current_setting('server_version') AS postgres_version,
  current_setting('server_encoding') AS encoding;
SELECT ssl, version, cipher FROM pg_stat_ssl WHERE pid = pg_backend_pid();
SELECT n.nspname, c.relname, c.relkind, c.relrowsecurity
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE (n.nspname = 'auth' AND c.relname IN ('users','identities'))
   OR (n.nspname = 'public' AND c.relname IN ('users','candidate_profiles','employer_profiles',
     'shifts','shift_applications','conversations','messages','escrow_transactions'))
ORDER BY n.nspname,c.relname;
SELECT a.attname, format_type(a.atttypid,a.atttypmod) AS column_type,
  a.attnotnull, c.collname, c.collprovider, c.collisdeterministic, c.collversion,
  pg_collation_actual_version(c.oid) AS actual_collation_version
FROM pg_attribute a LEFT JOIN pg_collation c ON c.oid=a.attcollation
WHERE a.attrelid=to_regclass('public.users') AND a.attnum>0 AND NOT a.attisdropped
  AND a.attname IN ('id','email','auth_user_id','role','is_kyc_verified');
-- Hash/flags, không in constraint expressions hoặc function body chứa nội dung ngoài scope.
SELECT conname,contype,convalidated,condeferrable,md5(pg_get_constraintdef(oid)) AS definition_hash
FROM pg_constraint WHERE conrelid=to_regclass('public.users') AND contype IN ('p','u','f');
SELECT c.relname, i.indisunique,i.indisvalid,i.indisready,
  md5(pg_get_indexdef(i.indexrelid)) AS definition_hash
FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid WHERE i.indrelid=to_regclass('public.users');
SELECT rolname,rolsuper,rolbypassrls FROM pg_roles
WHERE rolname IN ('anon','authenticated','supabase_auth_admin');
-- Effective column privilege bao gồm table grant; không đọc user row hoặc credential.
SELECT r.rolname,a.attname,
  has_column_privilege(r.oid,a.attrelid,a.attnum,'SELECT') AS can_select,
  has_column_privilege(r.oid,a.attrelid,a.attnum,'INSERT') AS can_insert,
  has_column_privilege(r.oid,a.attrelid,a.attnum,'UPDATE') AS can_update,
  a.attacl IS NOT NULL AS has_explicit_column_acl
FROM pg_roles r CROSS JOIN pg_attribute a
WHERE r.rolname IN ('anon','authenticated') AND a.attrelid=to_regclass('public.users')
  AND a.attnum>0 AND NOT a.attisdropped
  AND a.attname IN ('role','auth_user_id','is_kyc_verified','kyc_id_number','email');
SELECT polname,polcmd,polpermissive FROM pg_policy
WHERE polrelid=to_regclass('public.users');
SELECT t.tgname,t.tgenabled,p.prosecdef,p.prorettype='trigger'::regtype AS returns_trigger,
  p.proconfig=ARRAY['search_path=""'] AS has_empty_search_path,
  md5(p.prosrc) AS body_hash
FROM pg_trigger t JOIN pg_proc p ON p.oid=t.tgfoid
WHERE t.tgrelid=to_regclass('auth.users') AND t.tgname='selltime_auth_signup';
SELECT d.classid::regclass AS dependent_catalog,count(*) AS dependency_count
FROM pg_depend d JOIN pg_attribute a ON a.attrelid=d.refobjid AND a.attnum=d.refobjsubid
WHERE d.refclassid='pg_class'::regclass AND a.attrelid=to_regclass('public.users') AND a.attname='email'
GROUP BY d.classid;
-- Literal ASCII/Unicode chỉ mô tả default collation, không chứng minh provider/email-column parity.
SELECT sample,encode(convert_to(lower(sample COLLATE "default"),'UTF8'),'hex') AS lower_default_utf8
FROM (VALUES ('Auth007-Preflight@Test.Invalid'),('I@test.invalid'),(U&'\0130@test.invalid'),
  (U&'\0131@test.invalid'),(U&'\00E9@test.invalid'),(U&'e\0301@test.invalid')) fixtures(sample);
COMMIT;
