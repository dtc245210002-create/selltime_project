-- CHƯA CHẠY: chỉ thực thi trên project test disposable được duyệt riêng.
-- Không đổi collation, canonical email, role, binding, grants/RLS hoặc dữ liệu.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog, public;
SET LOCAL row_security = off;
-- Thứ tự lock theo đường INSERT Auth -> users của trigger 006; chặn ghi trước recheck.
LOCK TABLE auth.users IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.users IN ACCESS EXCLUSIVE MODE;

DO $migration$
DECLARE
  email_col smallint; binding_col smallint; auth_id_col smallint;
  old_constraint record; old_count integer; target_index oid;
  metadata jsonb; original_body text; guarded_body text; function_owner oid;
  baseline_body constant text := $baseline$
BEGIN
  INSERT INTO public.users(id, auth_user_id, email, phone, full_name, role, is_kyc_verified)
  VALUES (NEW.id::text, NEW.id, NEW.email, '',
    left(coalesce(nullif(btrim(NEW.raw_user_meta_data->>'full_name'), ''), 'Thành viên'), 100),
    'CANDIDATE', false);
  INSERT INTO public.candidate_profiles(user_id, bio, university, skills, weekly_availability, latitude, longitude, location_address)
  VALUES (NEW.id::text, '', '', '[]'::jsonb, '{}'::jsonb, 0, 0, '');
  RETURN NEW;
END
$baseline$;
  validation_prefix constant text := $guard$
BEGIN
  -- Không trim/lower/ghi lại NEW.email. Guard format hiện có, parity Unicode là gate riêng.
  IF NEW.email IS NULL OR length(NEW.email) > 120
     OR NEW.email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     OR NEW.email ~ U&'[\00A0\1680\2000-\200A\2028\2029\202F\205F\3000\FEFF]' THEN
    RAISE EXCEPTION 'Email Auth không hợp lệ' USING ERRCODE = '23514';
  END IF;
$guard$;
BEGIN
  IF current_setting('server_version_num')::int < 140000 THEN
    RAISE EXCEPTION 'HALT: cần PostgreSQL >= 14; phiên bản chưa được kiểm chứng';
  END IF;
  SELECT attnum INTO email_col FROM pg_attribute WHERE attrelid = 'public.users'::regclass
    AND attname = 'email' AND NOT attisdropped AND attnotnull
    AND atttypid = 'varchar'::regtype AND atttypmod = 124;
  SELECT attnum INTO binding_col FROM pg_attribute WHERE attrelid = 'public.users'::regclass
    AND attname = 'auth_user_id' AND NOT attisdropped AND NOT attnotnull AND atttypid = 'uuid'::regtype;
  SELECT attnum INTO auth_id_col FROM pg_attribute WHERE attrelid = 'auth.users'::regclass AND attname = 'id' AND NOT attisdropped;
  IF email_col IS NULL OR binding_col IS NULL OR auth_id_col IS NULL
     OR NOT (SELECT relrowsecurity AND relkind = 'r' FROM pg_class WHERE oid = 'public.users'::regclass) THEN
    RAISE EXCEPTION 'HALT: shape users/email/auth_user_id/RLS khác 006';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_collation c JOIN pg_attribute a ON a.attcollation=c.oid
    WHERE a.attrelid='public.users'::regclass AND a.attnum=email_col AND
      (NOT c.collisdeterministic OR c.collversion IS DISTINCT FROM pg_collation_actual_version(c.oid))) THEN
    RAISE EXCEPTION 'HALT: collation nondeterministic/version mismatch; không đổi collation';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.users'::regclass
       AND contype = 'u' AND conkey = ARRAY[binding_col] AND convalidated AND NOT condeferrable)
     OR NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.users'::regclass
       AND contype = 'f' AND conkey = ARRAY[binding_col] AND confrelid = 'auth.users'::regclass
       AND confkey = ARRAY[auth_id_col] AND confdeltype = 'c' AND convalidated) THEN
    RAISE EXCEPTION 'HALT: thiếu UNIQUE/FK binding đã xác minh';
  END IF;
  -- Counts/loại lỗi duy nhất; không đưa email người dùng vào log.
  IF EXISTS (SELECT 1 FROM public.users WHERE email IS NULL OR length(email) > 120
       OR email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
       OR email ~ U&'[\00A0\1680\2000-\200A\2028\2029\202F\205F\3000\FEFF]') THEN
    RAISE EXCEPTION 'HALT: email hiện có sai format/whitespace/normalization; không backfill';
  END IF;
  IF EXISTS (SELECT 1 FROM public.users WHERE auth_user_id IS NOT NULL GROUP BY lower(email) HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'HALT: duplicate Auth-linked theo lower(email)';
  END IF;
  IF EXISTS (SELECT 1 FROM public.users u LEFT JOIN auth.users a ON a.id = u.auth_user_id
       WHERE u.auth_user_id IS NOT NULL AND (a.id IS NULL OR a.email IS DISTINCT FROM u.email))
     OR EXISTS (SELECT 1 FROM auth.users a WHERE NOT EXISTS
       (SELECT 1 FROM public.users u WHERE u.auth_user_id=a.id))
     OR EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM public.candidate_profiles p WHERE p.user_id = u.id)) THEN
    RAISE EXCEPTION 'HALT: orphan/profile/email binding bất thường';
  END IF;
  SELECT count(*) INTO old_count FROM pg_constraint WHERE conrelid = 'public.users'::regclass
    AND contype = 'u' AND conkey = ARRAY[email_col];
  IF old_count > 1 THEN RAISE EXCEPTION 'HALT: nhiều constraint email'; END IF;
  SELECT * INTO old_constraint FROM pg_constraint WHERE conrelid = 'public.users'::regclass
    AND contype = 'u' AND conkey = ARRAY[email_col];
  IF old_count = 1 AND (old_constraint.condeferrable OR NOT old_constraint.convalidated
       OR pg_get_constraintdef(old_constraint.oid) <> 'UNIQUE (email)'
       OR NOT EXISTS (SELECT 1 FROM pg_index WHERE indexrelid=old_constraint.conindid
         AND indisunique AND indisvalid AND indisready AND indislive AND NOT indisexclusion
         AND indnkeyatts=1 AND indnatts=1 AND indpred IS NULL AND indexprs IS NULL
         AND indkey[0]=email_col)) THEN
    RAISE EXCEPTION 'HALT: definition constraint email khác dự kiến';
  END IF;
  target_index := to_regclass('public.users_auth_email_lower_uidx');
  IF target_index IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid JOIN pg_am am ON am.oid = c.relam
    WHERE i.indexrelid = target_index AND i.indrelid = 'public.users'::regclass
      AND i.indisunique AND i.indisvalid AND i.indisready AND i.indislive AND NOT i.indisexclusion
      AND i.indnkeyatts = 1 AND i.indnatts = 1 AND am.amname = 'btree'
      AND pg_get_indexdef(i.indexrelid) = 'CREATE UNIQUE INDEX users_auth_email_lower_uidx ON public.users USING btree (lower((email)::text)) WHERE (auth_user_id IS NOT NULL)'
  ) THEN RAISE EXCEPTION 'HALT: definition index 007 khác dự kiến'; END IF;
  -- Các UNIQUE khác trên email có thể giữ collision hoặc đổi semantics: dừng.
  IF EXISTS (SELECT 1 FROM pg_index i WHERE i.indrelid = 'public.users'::regclass AND i.indisunique
    AND i.indexrelid IS DISTINCT FROM target_index
    AND (old_count = 0 OR i.indexrelid <> old_constraint.conindid)
    AND (email_col = ANY(i.indkey) OR coalesce(pg_get_expr(i.indexprs,i.indrelid),'') ~ '\memail\M')) THEN
    RAISE EXCEPTION 'HALT: unknown unique email index';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND confrelid = 'public.users'::regclass
       AND email_col = ANY(confkey))
     OR EXISTS (SELECT 1 FROM pg_depend d WHERE d.refclassid = 'pg_class'::regclass
       AND d.refobjid = 'public.users'::regclass AND d.refobjsubid = email_col
       AND NOT (d.classid = 'pg_class'::regclass AND
         (d.objid = target_index OR (old_count = 1 AND d.objid = old_constraint.conindid)))
       AND NOT (d.classid = 'pg_constraint'::regclass AND old_count = 1 AND d.objid = old_constraint.oid))
     OR EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND p.prosrc ~* '\memail\M'
       AND p.prosrc ~* '\musers\M' AND p.oid <> 'public.handle_auth_signup()'::regprocedure)
     OR EXISTS (SELECT 1 FROM pg_trigger t JOIN pg_proc p ON p.oid=t.tgfoid
       WHERE t.tgrelid IN ('public.users'::regclass,'auth.users'::regclass) AND NOT t.tgisinternal
       AND p.oid <> 'public.handle_auth_signup()'::regprocedure AND p.prosrc ~* '\memail\M') THEN
    RAISE EXCEPTION 'HALT: dependency email chưa được xử lý (catalog/function); không CASCADE';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass
       AND tgname = 'selltime_auth_signup' AND tgfoid = 'public.handle_auth_signup()'::regprocedure
       AND tgtype = 5 AND tgenabled = 'O' AND NOT tgisinternal)
     OR NOT EXISTS (SELECT 1 FROM pg_proc WHERE oid = 'public.handle_auth_signup()'::regprocedure
       AND prosecdef AND prorettype = 'trigger'::regtype AND proconfig = ARRAY['search_path=""']
       AND prolang = (SELECT oid FROM pg_language WHERE lanname = 'plpgsql')) THEN
    RAISE EXCEPTION 'HALT: trigger/security/search_path khác 006';
  END IF;
  SELECT prosrc, proowner INTO original_body, function_owner FROM pg_proc WHERE oid = 'public.handle_auth_signup()'::regprocedure;
  guarded_body := validation_prefix || substring(baseline_body FROM position('INSERT INTO' IN baseline_body));
  IF old_count = 0 THEN
    IF target_index IS NULL THEN RAISE EXCEPTION 'HALT: thiếu constraint cũ và index mới'; END IF;
    BEGIN metadata := obj_description(target_index,'pg_class')::jsonb;
    EXCEPTION WHEN OTHERS THEN RAISE EXCEPTION 'HALT: metadata rollback không hợp lệ'; END;
    IF metadata->>'migration' IS DISTINCT FROM '007' OR metadata->>'constraint_definition' IS DISTINCT FROM 'UNIQUE (email)'
       OR metadata->>'baseline_body' IS DISTINCT FROM baseline_body
       OR metadata->>'guarded_body' IS DISTINCT FROM guarded_body
       OR original_body IS DISTINCT FROM guarded_body
       OR metadata->>'function_owner' IS DISTINCT FROM function_owner::text
       OR nullif(metadata->>'constraint_name','') IS NULL THEN
      RAISE EXCEPTION 'HALT: trạng thái áp dụng/metadata/function khác dự kiến';
    END IF;
    RETURN; -- rerun chỉ khi mọi definition đúng; không sửa bất thường.
  END IF;
  IF original_body IS DISTINCT FROM baseline_body THEN RAISE EXCEPTION 'HALT: function 006 đã đổi'; END IF;
  IF target_index IS NOT NULL AND obj_description(target_index,'pg_class') IS NOT NULL THEN
    RAISE EXCEPTION 'HALT: index có metadata ngoài trạng thái dự kiến';
  END IF;
  -- Tất cả recheck trên dữ liệu/catalog đã nằm dưới lock, trước DDL đầu tiên.
  IF target_index IS NULL THEN
    CREATE UNIQUE INDEX users_auth_email_lower_uidx ON public.users (lower(email)) WHERE auth_user_id IS NOT NULL;
  END IF;
  metadata := jsonb_build_object('migration','007','constraint_name',old_constraint.conname,
    'constraint_definition','UNIQUE (email)','baseline_body',baseline_body,'guarded_body',guarded_body,
    'function_owner',function_owner::text);
  EXECUTE format('COMMENT ON INDEX public.users_auth_email_lower_uidx IS %L',metadata::text);
  EXECUTE format('CREATE OR REPLACE FUNCTION public.handle_auth_signup() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = %L AS %L','',guarded_body);
  -- CREATE OR REPLACE giữ owner và ACL; không DROP function/trigger hoặc cấp quyền mới.
  EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I',old_constraint.conname);
  RAISE NOTICE '007 chuẩn bị: PostgreSQL %, extension count %, email collation %; parity provider/Unicode chưa xác minh',
    current_setting('server_version'), (SELECT count(*) FROM pg_extension),
    (SELECT attcollation::regcollation FROM pg_attribute WHERE attrelid='public.users'::regclass AND attnum=email_col);
END
$migration$;
COMMIT;
