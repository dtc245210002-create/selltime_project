-- Rollback SCHEMA có điều kiện, KHÔNG phải cleanup fixture. NOT RUN.
-- Chỉ chạy riêng sau phê duyệt; collision phải dừng trước DDL đầu tiên.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog, public;
SET LOCAL row_security = off;
LOCK TABLE auth.users IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.users IN ACCESS EXCLUSIVE MODE;
DO $rollback$
DECLARE target_index oid := to_regclass('public.users_auth_email_lower_uidx'); metadata jsonb; email_col smallint;
BEGIN
  IF target_index IS NULL OR NOT EXISTS (
    SELECT 1 FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid JOIN pg_am a ON a.oid=c.relam
    WHERE i.indexrelid=target_index AND i.indrelid='public.users'::regclass AND i.indisunique
      AND i.indisvalid AND i.indisready AND i.indislive AND NOT i.indisexclusion
      AND i.indnatts=1 AND i.indnkeyatts=1 AND a.amname='btree'
      AND pg_get_indexdef(i.indexrelid)='CREATE UNIQUE INDEX users_auth_email_lower_uidx ON public.users USING btree (lower((email)::text)) WHERE (auth_user_id IS NOT NULL)'
  ) THEN RAISE EXCEPTION 'HALT: index 007 thiếu hoặc definition mismatch'; END IF;
  SELECT attnum INTO email_col FROM pg_attribute WHERE attrelid='public.users'::regclass
    AND attname='email' AND NOT attisdropped AND attnotnull AND atttypid='varchar'::regtype AND atttypmod=124;
  IF email_col IS NULL THEN RAISE EXCEPTION 'HALT: shape email khác baseline'; END IF;
  BEGIN metadata := obj_description(target_index,'pg_class')::jsonb;
  EXCEPTION WHEN OTHERS THEN RAISE EXCEPTION 'HALT: metadata rollback không hợp lệ'; END;
  IF metadata->>'migration' IS DISTINCT FROM '007'
     OR metadata->>'constraint_definition' IS DISTINCT FROM 'UNIQUE (email)'
     OR md5(metadata->>'baseline_body') IS DISTINCT FROM 'f9cae578d8fa6adc5b0a83cd93856919'
     OR md5(metadata->>'guarded_body') IS DISTINCT FROM 'a5dde2b5722e6fb1b8a34693b7a59cc6'
     OR nullif(metadata->>'constraint_name','') IS NULL
     OR NOT EXISTS (SELECT 1 FROM pg_proc WHERE oid='public.handle_auth_signup()'::regprocedure
       AND prosrc=metadata->>'guarded_body' AND proowner::text=metadata->>'function_owner'
       AND prosecdef AND prorettype='trigger'::regtype AND proconfig=ARRAY['search_path=""']
       AND prolang=(SELECT oid FROM pg_language WHERE lanname='plpgsql'))
     OR NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='auth.users'::regclass
       AND tgname='selltime_auth_signup' AND tgfoid='public.handle_auth_signup()'::regprocedure
       AND tgtype=5 AND tgenabled='O' AND NOT tgisinternal) THEN
    RAISE EXCEPTION 'HALT: metadata/function/trigger khác artifact đã duyệt';
  END IF;
  IF EXISTS (SELECT 1 FROM public.users GROUP BY email HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'HALT: collision hợp lệ mới; rollback bị chặn, cần forward fix riêng' USING ERRCODE='23505';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.users'::regclass
       AND (conname=metadata->>'constraint_name' OR (contype='u' AND conkey=ARRAY[email_col])))
     OR to_regclass(format('public.%I',metadata->>'constraint_name')) IS NOT NULL
     OR EXISTS (SELECT 1 FROM pg_depend WHERE refclassid='pg_class'::regclass AND refobjid=target_index) THEN
    RAISE EXCEPTION 'HALT: constraint/name/dependency conflict trước rollback DDL';
  END IF;
  -- Khôi phục uniqueness cũ trước khi bỏ index mới; không sửa bất kỳ row nào.
  EXECUTE format('ALTER TABLE public.users ADD CONSTRAINT %I UNIQUE (email)',metadata->>'constraint_name');
  EXECUTE format('CREATE OR REPLACE FUNCTION public.handle_auth_signup() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = %L AS %L','',metadata->>'baseline_body');
  DROP INDEX public.users_auth_email_lower_uidx;
END
$rollback$;
COMMIT;
