-- Hậu kiểm read-only: kiểm tra collision trước suite VÀ kiểm tra cleanup sau suite.
-- Chạy trong phiên psql đặc quyền MỚI đã duyệt sau bất kỳ lỗi suite nào.
\set ON_ERROR_STOP on
BEGIN READ ONLY;
-- Nếu quyền phiên vẫn chịu RLS, PostgreSQL phải báo lỗi thay vì che residue.
SET LOCAL row_security = off;
DO $$
DECLARE table_name TEXT; collision BOOLEAN;
BEGIN
  IF to_regclass('auth.users') IS NULL OR to_regprocedure('auth.uid()') IS NULL THEN
    RAISE EXCEPTION 'Cần dependencies Auth Supabase thật';
  END IF;
  IF EXISTS (SELECT 1 FROM auth.users WHERE id IN (
    '00000000-0000-4000-8000-000000000601'::uuid,
    '00000000-0000-4000-8000-000000000602'::uuid,
    '00000000-0000-4000-8000-000000000603'::uuid,
    '00000000-0000-4000-8000-000000000604'::uuid)
    OR email LIKE 'auth006-%') THEN
    RAISE EXCEPTION 'Collision/residue fixture Auth; dừng và điều tra';
  END IF;
  -- Quét mọi trường, gồm các cột FK và khóa chính.
  FOREACH table_name IN ARRAY ARRAY['users','candidate_profiles','employer_profiles','shifts','shift_applications','escrow_transactions','conversations','messages'] LOOP
    IF to_regclass('public.' || table_name) IS NULL THEN
      RAISE EXCEPTION 'Thiếu bảng bắt buộc public.%', table_name;
    END IF;
    EXECUTE format($query$SELECT EXISTS (SELECT 1 FROM public.%I r
      WHERE to_jsonb(r)::text LIKE '%%auth006-%%'
      OR to_jsonb(r)::text ~ '00000000-0000-4000-8000-00000000060[1234]')$query$, table_name)
      INTO collision;
    IF collision THEN
      RAISE EXCEPTION 'Collision/residue fixture trong public.%; dừng và điều tra', table_name;
    END IF;
  END LOOP;
  IF to_regclass('auth.identities') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM auth.identities WHERE user_id IN (
      '00000000-0000-4000-8000-000000000601'::uuid,
      '00000000-0000-4000-8000-000000000602'::uuid,
      '00000000-0000-4000-8000-000000000603'::uuid,
      '00000000-0000-4000-8000-000000000604'::uuid)) THEN
      RAISE EXCEPTION 'Collision/residue fixture Auth identity';
    END IF;
  END IF;
END $$;
COMMIT;
\echo Namespace fixture sạch (hậu kiểm read-only).
