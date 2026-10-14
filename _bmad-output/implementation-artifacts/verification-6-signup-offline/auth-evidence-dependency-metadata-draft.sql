-- OFFLINE DRAFT. Separate human execution approval required; metadata only.
\set ON_ERROR_STOP on
BEGIN READ ONLY;
SET LOCAL statement_timeout='20s';
SET LOCAL lock_timeout='2s';
-- Catalog-only exact cardinality; no application rows/counts.
SELECT (SELECT count(*)=3 FROM pg_proc WHERE oid IN (17843,17844,17849)) AS exact_objects \gset
\if :exact_objects
\else
  \echo HALT: expected exactly three catalog objects
  SELECT 1/0;
\endif
-- Immutable manifest of all eleven policies observed in accepted M evidence.
WITH expected(relname,polname,using_hash,check_hash) AS (VALUES
 ('candidate_profiles','st_auth_candidate_own','d95bc4a970654a065680a4356d3c40fa','d41d8cd98f00b204e9800998ecf8427e'),
 ('conversations','st_auth_conversations_members','9c2334ebde05b970021b4e2bd81735f8','d41d8cd98f00b204e9800998ecf8427e'),
 ('employer_profiles','st_auth_employer_own','d95bc4a970654a065680a4356d3c40fa','d41d8cd98f00b204e9800998ecf8427e'),
 ('messages','st_auth_messages_delete','4ff72f96412fdf6a515485d71e656af1','d41d8cd98f00b204e9800998ecf8427e'),
 ('messages','st_auth_messages_members','68b8526bfe90aaffbd2db24bd34dceef','d41d8cd98f00b204e9800998ecf8427e'),
 ('messages','st_auth_messages_send','d41d8cd98f00b204e9800998ecf8427e','4ff72f96412fdf6a515485d71e656af1'),
 ('shift_applications','st_auth_applications_own','ce0b801474ed2c56e88ae91fd0d2fe27','d41d8cd98f00b204e9800998ecf8427e'),
 ('shifts','st_auth_shifts_create','d41d8cd98f00b204e9800998ecf8427e','d4d6af0b2dfe8a2e050f0d6064df33e0'),
 ('shifts','st_auth_shifts_members','44744c69f0cecba7b153e5ccbd1c1ff6','d41d8cd98f00b204e9800998ecf8427e'),
 ('shifts','st_auth_shifts_public','1cc9ce665ba2a6c22b52d4879d8f3f36','d41d8cd98f00b204e9800998ecf8427e'),
 ('users','st_auth_users_own','e39ae6c427cf13173dd70d5d8106758b','d41d8cd98f00b204e9800998ecf8427e')
), actual AS (
 SELECT c.relname::text,pol.polname::text,
 md5(coalesce(pg_get_expr(pol.polqual,pol.polrelid),'')) AS using_hash,
 md5(coalesce(pg_get_expr(pol.polwithcheck,pol.polrelid),'')) AS check_hash
 FROM pg_policy pol JOIN pg_class c ON c.oid=pol.polrelid JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relname IN ('users','candidate_profiles','employer_profiles','shifts',
 'shift_applications','conversations','messages','escrow_transactions')
)
SELECT NOT EXISTS (SELECT 1 FROM expected e FULL JOIN actual a USING(relname,polname)
 WHERE e.relname IS NULL OR a.relname IS NULL
 OR e.using_hash IS DISTINCT FROM a.using_hash OR e.check_hash IS DISTINCT FROM a.check_hash)
 AS policy_continuity \gset
\if :policy_continuity
\else
  \echo HALT: M policy manifest drift
  SELECT 1/0;
\endif
-- Fail closed on stale OIDs, changed trigger binding, or known fingerprint drift.
SELECT (
 EXISTS (SELECT 1 FROM pg_trigger t JOIN pg_proc p ON p.oid=t.tgfoid
   JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE t.tgrelid=to_regclass('public.users') AND NOT t.tgisinternal
     AND t.tgname='st_auth_immutable_account' AND t.tgenabled='O' AND t.tgtype=19
     AND p.oid=17849 AND n.nspname='public' AND p.proname='st_auth_immutable_account'
     AND pg_get_function_identity_arguments(p.oid)='' AND NOT p.prosecdef
     AND pg_get_userbyid(p.proowner)='postgres'
     AND p.proconfig=ARRAY['search_path=""']
     AND md5(p.prosrc)='4226f087fc497ad3d0bd862ec0178e6f')
 AND NOT EXISTS (SELECT 1 FROM (VALUES (17843::oid),(17844::oid)) expected(oid)
   WHERE NOT EXISTS (SELECT 1 FROM pg_proc p WHERE p.oid=expected.oid)
      OR NOT EXISTS (SELECT 1 FROM pg_depend d JOIN pg_policy pol ON pol.oid=d.objid
         JOIN pg_class c ON c.oid=pol.polrelid JOIN pg_namespace n ON n.oid=c.relnamespace
         WHERE d.classid='pg_policy'::regclass AND d.refclassid='pg_proc'::regclass
           AND d.refobjid=expected.oid AND n.nspname='public'
           AND c.relname IN ('users','candidate_profiles','employer_profiles','shifts',
             'shift_applications','conversations','messages','escrow_transactions')))
) AS dependency_gate \gset
\if :dependency_gate
\else
  \echo HALT: dependency identity or known fingerprint drift
  SELECT 1/0;
\endif
-- Identity of the two unknown OIDs is acquired here, not assumed from OID alone.
SELECT p.oid,n.nspname,p.proname,pg_get_function_identity_arguments(p.oid) AS signature,
 pg_get_userbyid(p.proowner) AS owner,p.prosecdef,p.provolatile,p.prokind,
 p.prorettype::regtype AS return_type,l.lanname,
 coalesce(p.proconfig=ARRAY['search_path=""'],false) AS empty_search_path,
 md5(p.prosrc) AS body_hash,md5(pg_get_functiondef(p.oid)) AS definition_hash
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 JOIN pg_language l ON l.oid=p.prolang
WHERE p.oid IN (17843,17844,17849) ORDER BY p.oid;
-- Explicit and effective grants for these three objects; no function invocation.
SELECT p.oid,CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END AS grantee,
 pg_get_userbyid(a.grantor) AS grantor,a.privilege_type,a.is_grantable
FROM pg_proc p CROSS JOIN LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
WHERE p.oid IN (17843,17844,17849) ORDER BY p.oid,grantee,privilege_type;
SELECT p.oid,r.rolname,has_function_privilege(r.oid,p.oid,'EXECUTE') AS can_execute
FROM pg_proc p CROSS JOIN pg_roles r
WHERE p.oid IN (17843,17844,17849)
 AND r.rolname IN ('anon','authenticated','supabase_auth_admin') ORDER BY p.oid,r.rolname;
-- Only direct policy edges into the exact three objects; no transitive expansion.
SELECT c.relname,pol.polname,d.refobjid AS function_oid,
 md5(coalesce(pg_get_expr(pol.polqual,pol.polrelid),'')) AS using_hash,
 md5(coalesce(pg_get_expr(pol.polwithcheck,pol.polrelid),'')) AS check_hash
FROM pg_depend d JOIN pg_policy pol ON pol.oid=d.objid
 JOIN pg_class c ON c.oid=pol.polrelid JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE d.classid='pg_policy'::regclass AND d.refclassid='pg_proc'::regclass
 AND d.refobjid IN (17843,17844,17849) AND n.nspname='public'
 AND c.relname IN ('users','candidate_profiles','employer_profiles','shifts',
  'shift_applications','conversations','messages','escrow_transactions')
ORDER BY c.relname,pol.polname,d.refobjid;
COMMIT;
