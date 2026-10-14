-- NOT RUN: sau baseline -> 006 -> 007 trên project test thật được duyệt.
-- Kiểm tra SQLSTATE và rows thật; ROLLBACK toàn bộ fixture, không cleanup dữ liệu có sẵn.
\set ON_ERROR_STOP on
\ir 007_verify_residue.sql
BEGIN;
SET LOCAL row_security = off;
CREATE FUNCTION pg_temp.assert_007(ok boolean, message text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION 'FAIL 007: %',message; END IF; END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated' AND NOT rolsuper AND NOT rolbypassrls) THEN
    RAISE EXCEPTION 'HALT: authenticated không được bypass RLS';
  END IF;
END $$;
INSERT INTO public.users(id,email,phone,full_name,role,is_kyc_verified) VALUES
  ('auth007-demo','auth007-collision@test.invalid','','DEMO','EMPLOYER',true),
  ('auth007-demo-case','Auth007-Case@Test.Invalid','','DEMO case','EMPLOYER',true),
  ('auth007-peer','auth007-peer@test.invalid','','DEMO peer','CANDIDATE',false);
INSERT INTO public.employer_profiles(user_id,company_name,address) VALUES ('auth007-demo','auth007-company','Test');
INSERT INTO public.shifts(id,employer_id,employer_name,title,shift_start,shift_end,latitude,longitude,location_address)
VALUES ('auth007-shift','auth007-demo','DEMO','Test','18:00','20:00',0,0,'Test');
INSERT INTO public.conversations(id,candidate_id,employer_id) VALUES ('auth007-conversation','auth007-peer','auth007-demo');
INSERT INTO public.messages(id,conversation_id,sender_id,sender_name,content)
VALUES ('auth007-message','auth007-conversation','auth007-demo','DEMO','Test');
CREATE TEMP TABLE snapshot_007 ON COMMIT DROP AS
SELECT 'users'::text AS kind,to_jsonb(u) AS row FROM public.users u WHERE id LIKE 'auth007-%'
UNION ALL SELECT 'employer',to_jsonb(p) FROM public.employer_profiles p WHERE user_id='auth007-demo'
UNION ALL SELECT 'shift',to_jsonb(s) FROM public.shifts s WHERE id='auth007-shift'
UNION ALL SELECT 'conversation',to_jsonb(c) FROM public.conversations c WHERE id='auth007-conversation'
UNION ALL SELECT 'message',to_jsonb(m) FROM public.messages m WHERE id='auth007-message';
INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES
 ('00000000-0000-4000-8000-000000000701','auth007-collision@test.invalid','{"full_name":"Auth","role":"ADMIN","auth_user_id":"auth007-demo"}'),
 ('00000000-0000-4000-8000-000000000702','auth007-case@test.invalid','{"full_name":"Case","role":"EMPLOYER"}');
SELECT pg_temp.assert_007((SELECT count(*)=2 AND bool_and(role='CANDIDATE' AND is_kyc_verified=false AND id=auth_user_id::text)
  FROM public.users WHERE auth_user_id IN ('00000000-0000-4000-8000-000000000701','00000000-0000-4000-8000-000000000702')),'CAP-1 UUID/Candidate/KYC riêng, bỏ metadata spoof');
SELECT pg_temp.assert_007((SELECT count(*)=2 FROM public.candidate_profiles WHERE user_id IN
 ('00000000-0000-4000-8000-000000000701','00000000-0000-4000-8000-000000000702')),'CAP-1 profile mới');
CREATE TEMP TABLE after_007 ON COMMIT DROP AS
SELECT 'users'::text AS kind,to_jsonb(u) AS row FROM public.users u WHERE id LIKE 'auth007-%'
UNION ALL SELECT 'employer',to_jsonb(p) FROM public.employer_profiles p WHERE user_id='auth007-demo'
UNION ALL SELECT 'shift',to_jsonb(s) FROM public.shifts s WHERE id='auth007-shift'
UNION ALL SELECT 'conversation',to_jsonb(c) FROM public.conversations c WHERE id='auth007-conversation'
UNION ALL SELECT 'message',to_jsonb(m) FROM public.messages m WHERE id='auth007-message';
SELECT pg_temp.assert_007(NOT EXISTS ((TABLE snapshot_007 EXCEPT ALL TABLE after_007) UNION ALL
 (TABLE after_007 EXCEPT ALL TABLE snapshot_007)),'CAP-1 DEMO/quan hệ giữ nguyên byte values');
DO $$
DECLARE bad_email text; attempted uuid := '00000000-0000-4000-8000-000000000703';
BEGIN
  FOREACH bad_email IN ARRAY ARRAY['auth007-collision@test.invalid','AUTH007-COLLISION@TEST.INVALID'] LOOP
    BEGIN
      INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES(attempted,bad_email,'{}');
      RAISE EXCEPTION 'FAIL: duplicate Auth được chấp nhận';
    EXCEPTION WHEN unique_violation THEN NULL;
    END;
    PERFORM pg_temp.assert_007(NOT EXISTS(SELECT 1 FROM auth.users WHERE id=attempted)
      AND NOT EXISTS(SELECT 1 FROM public.users WHERE auth_user_id=attempted)
      AND NOT EXISTS(SELECT 1 FROM public.candidate_profiles WHERE user_id=attempted::text),'CAP-2 duplicate không orphan');
  END LOOP;
  FOREACH bad_email IN ARRAY ARRAY[NULL::text,'',' ','auth007-x @test.invalid',repeat('x',108)||'@test.invalid',U&'auth007-x\00A0@test.invalid'] LOOP
    BEGIN
      INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES(attempted,bad_email,'{}');
      RAISE EXCEPTION 'FAIL: email sai được chấp nhận';
    EXCEPTION WHEN check_violation OR not_null_violation OR string_data_right_truncation THEN NULL;
    END;
    PERFORM pg_temp.assert_007(NOT EXISTS(SELECT 1 FROM auth.users WHERE id=attempted)
      AND NOT EXISTS(SELECT 1 FROM public.users WHERE auth_user_id=attempted)
      AND NOT EXISTS(SELECT 1 FROM public.candidate_profiles WHERE user_id=attempted::text),'CAP-2 invalid không orphan');
  END LOOP;
END $$;
SET LOCAL row_security = on;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000701',true);
SELECT pg_temp.assert_007(public.current_app_user_id()='00000000-0000-4000-8000-000000000701' AND public.current_app_role()='CANDIDATE','CAP-1 binding chỉ UUID');
SELECT pg_temp.assert_007((SELECT count(*)=1 FROM public.users),'CAP-1 RLS không đọc DEMO trùng email');
SELECT pg_temp.assert_007((SELECT count(*)=0 FROM public.shifts WHERE id='auth007-shift') AND
 (SELECT count(*)=0 FROM public.conversations WHERE id='auth007-conversation') AND
 (SELECT count(*)=0 FROM public.messages WHERE id='auth007-message') AND
 (SELECT count(*)=0 FROM public.employer_profiles),'CAP-1 không kế thừa ownership/read access');
DO $$ BEGIN
  BEGIN UPDATE public.users SET role='ADMIN'; RAISE EXCEPTION 'FAIL: role spoof'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.users SET auth_user_id='00000000-0000-4000-8000-000000000702'; RAISE EXCEPTION 'FAIL: binding spoof'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
ROLLBACK;
\ir 007_verify_residue.sql
