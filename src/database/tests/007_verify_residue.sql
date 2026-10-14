-- Hậu kiểm chỉ đọc trước/sau suite; project test thật đã duyệt riêng. NOT RUN.
\set ON_ERROR_STOP on
BEGIN READ ONLY;
SET LOCAL row_security = off;
DO $$
DECLARE t text; residue boolean;
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email LIKE 'auth007-%'
      OR id::text ~ '^00000000-0000-4000-8000-0000000007[0-9]{2}$') THEN
    RAISE EXCEPTION 'HALT: collision/residue fixture Auth 007';
  END IF;
  FOREACH t IN ARRAY ARRAY['users','candidate_profiles','employer_profiles','shifts','shift_applications','conversations','messages','escrow_transactions'] LOOP
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM public.%I r WHERE to_jsonb(r)::text LIKE %L OR to_jsonb(r)::text ~ %L)',
      t,'%auth007-%','00000000-0000-4000-8000-0000000007[0-9]{2}') INTO residue;
    IF residue THEN RAISE EXCEPTION 'HALT: collision/residue fixture public.%',t; END IF;
  END LOOP;
  IF to_regclass('auth.identities') IS NOT NULL AND EXISTS (SELECT 1 FROM auth.identities
       WHERE user_id::text ~ '^00000000-0000-4000-8000-0000000007[0-9]{2}$') THEN
    RAISE EXCEPTION 'HALT: residue Auth identities 007';
  END IF;
END $$;
COMMIT;
