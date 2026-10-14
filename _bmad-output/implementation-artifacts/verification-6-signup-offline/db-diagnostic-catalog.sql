-- DRAFT FOR REVIEW ONLY. NOT APPROVED TO RUN.
\set ON_ERROR_STOP on
BEGIN READ ONLY;
SET LOCAL statement_timeout = '20s';
SET LOCAL lock_timeout = '2s';
SELECT current_database(), current_user, current_setting('server_version');
SELECT ssl, version, cipher FROM pg_stat_ssl WHERE pid=pg_backend_pid();
-- B1: metadata/hash only; never emit function bodies or trigger arguments.
SELECT t.tgname,t.tgenabled,t.tgtype,n.nspname AS function_schema,p.proname,
  pg_get_function_identity_arguments(p.oid) AS signature,
  pg_get_userbyid(p.proowner) AS owner,p.prosecdef,
  p.prorettype='trigger'::regtype AS returns_trigger,
  p.proconfig=ARRAY['search_path=""'] AS has_empty_search_path,
  md5(p.prosrc) AS body_hash
FROM pg_trigger t JOIN pg_proc p ON p.oid=t.tgfoid
JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE t.tgrelid=to_regclass('auth.users') AND NOT t.tgisinternal
ORDER BY t.tgname;
SELECT n.nspname,p.proname,pg_get_function_identity_arguments(p.oid) AS signature,
  pg_get_userbyid(p.proowner) AS owner,p.prosecdef,md5(p.prosrc) AS body_hash
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname IN ('handle_auth_signup','current_app_user_id','current_app_role','set_employer_role');
-- B2: default/database collation metadata; no version refresh or policy changes.
SELECT datname,datlocprovider,datcollate,datctype,datcollversion,
  pg_database_collation_actual_version(oid) AS actual_database_version
FROM pg_database WHERE datname=current_database();
SELECT n.nspname,c.collname,c.collprovider,c.collisdeterministic,c.collversion,
  pg_collation_actual_version(c.oid) AS actual_version
FROM pg_collation c JOIN pg_namespace n ON n.oid=c.collnamespace
WHERE c.oid IN (SELECT attcollation FROM pg_attribute
  WHERE attrelid=to_regclass('public.users') AND attname='email' AND NOT attisdropped)
  OR (n.nspname='pg_catalog' AND c.collname='default');
-- B3: semantics independent of text rendering.
SELECT conname,contype,convalidated,condeferrable,condeferred,
  confrelid::regclass AS referenced_relation,confdeltype,confupdtype,confmatchtype,
  ARRAY(SELECT a.attname FROM unnest(conkey) WITH ORDINALITY k(num,seq)
    JOIN pg_attribute a ON a.attrelid=conrelid AND a.attnum=k.num ORDER BY seq) AS columns,
  ARRAY(SELECT a.attname FROM unnest(confkey) WITH ORDINALITY k(num,seq)
    JOIN pg_attribute a ON a.attrelid=confrelid AND a.attnum=k.num ORDER BY seq) AS referenced_columns
FROM pg_constraint WHERE conrelid=to_regclass('public.users') AND contype IN ('f','u','p');
SELECT indexrelid::regclass AS index_name,indisunique,indisvalid,indisready,
  indkey,indclass,indcollation,indpred IS NOT NULL AS partial,
  indexprs IS NOT NULL AS expression_index,md5(pg_get_indexdef(indexrelid)) AS definition_hash
FROM pg_index WHERE indrelid=to_regclass('public.users');
SELECT d.classid::regclass AS dependent_catalog,d.objid,d.objsubid,d.deptype,
  pg_describe_object(d.classid,d.objid,d.objsubid) AS object_identity
FROM pg_depend d JOIN pg_attribute a ON a.attrelid=d.refobjid AND a.attnum=d.refobjsubid
WHERE d.refclassid='pg_class'::regclass AND a.attrelid=to_regclass('public.users') AND a.attname='email';
COMMIT;
