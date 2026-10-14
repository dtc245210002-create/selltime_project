-- Integration chỉ chạy trên database test được xác minh, sau migration 006.
-- Fixture rollback toàn bộ; tuyệt đối không chạy production/live seed.
\set ON_ERROR_STOP on
-- Preflight collision chạy ngoài transaction fixture, với quyền đọc đặc quyền.
\ir 006_verify_rollback.sql
BEGIN;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated'
    AND NOT rolsuper AND NOT rolbypassrls) THEN
    RAISE EXCEPTION 'authenticated phải tồn tại và không SUPERUSER/BYPASSRLS';
  END IF;
END $$;
CREATE FUNCTION pg_temp.assert_true(ok BOOLEAN, message TEXT) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION 'FAIL: %', message; END IF; END $$;

INSERT INTO auth.users(id, email, raw_user_meta_data)
VALUES
 ('00000000-0000-4000-8000-000000000601', 'auth006-a@test.invalid', '{"full_name":"A","role":"ADMIN"}'),
 ('00000000-0000-4000-8000-000000000602', 'auth006-b@test.invalid', '{"full_name":"B","role":"EMPLOYER"}'),
 ('00000000-0000-4000-8000-000000000603', 'auth006-admin@test.invalid', '{"full_name":"Admin"}');
SELECT pg_temp.assert_true((SELECT count(*) = 3 AND bool_and(role = 'CANDIDATE') FROM public.users WHERE id IN
 ('00000000-0000-4000-8000-000000000601','00000000-0000-4000-8000-000000000602','00000000-0000-4000-8000-000000000603')), 'Signup luôn Candidate, bỏ qua metadata role');
UPDATE public.users SET role = 'EMPLOYER' WHERE id = '00000000-0000-4000-8000-000000000602';
UPDATE public.users SET role = 'ADMIN' WHERE id = '00000000-0000-4000-8000-000000000603';
INSERT INTO public.users(id,email,phone,full_name,role) VALUES ('auth006-demo', 'auth006-demo@test.invalid','','DEMO','EMPLOYER');
INSERT INTO public.employer_profiles(user_id,company_name,address,verified_badge,checkin_pin,escrow_balance) VALUES
 ('00000000-0000-4000-8000-000000000601','auth006-company-a','Test A',false,'0061',61),
 ('00000000-0000-4000-8000-000000000602','auth006-company-b','Test B',false,'0062',62);
INSERT INTO public.escrow_transactions(id,code,employer_id,title,amount) VALUES
 ('auth006-financial','auth006-code','00000000-0000-4000-8000-000000000602','Test locked ledger',62);
INSERT INTO public.conversations(id,candidate_id,employer_id) VALUES
 ('auth006-chat','00000000-0000-4000-8000-000000000601','00000000-0000-4000-8000-000000000602'),
 ('auth006-private','00000000-0000-4000-8000-000000000603','00000000-0000-4000-8000-000000000602');
INSERT INTO public.messages(id,conversation_id,sender_id,sender_name,content) VALUES
 ('auth006-private-msg','auth006-private','00000000-0000-4000-8000-000000000602','B','Riêng tư');
INSERT INTO public.shifts(id, employer_id, employer_name,title,shift_start,shift_end,latitude,longitude,location_address)
VALUES ('auth006-private-shift','00000000-0000-4000-8000-000000000602','B','Ca riêng','18:00','20:00',0,0,'Test');
INSERT INTO public.shift_applications(id, shift_id, candidate_id)
VALUES ('auth006-private-application','auth006-private-shift','00000000-0000-4000-8000-000000000603');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000601',true);
SELECT pg_temp.assert_true(public.current_app_user_id() = '00000000-0000-4000-8000-000000000601', 'UUID binding đúng');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.users), 'Không đọc hồ sơ B/Admin/DEMO');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.candidate_profiles), 'Candidate profiles riêng');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.conversations), 'Không đọc hội thoại riêng');
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.messages), 'Không đọc tin riêng');
DO $$ DECLARE affected INTEGER; BEGIN
  UPDATE public.users SET phone = '006-A' WHERE id = '00000000-0000-4000-8000-000000000601';
  GET DIAGNOSTICS affected = ROW_COUNT;
  PERFORM pg_temp.assert_true(affected = 1, 'UPDATE user owner tác động đúng một row thật');
  UPDATE public.candidate_profiles SET bio = 'auth006-updated-bio' WHERE user_id = '00000000-0000-4000-8000-000000000601';
  GET DIAGNOSTICS affected = ROW_COUNT;
  PERFORM pg_temp.assert_true(affected = 1, 'UPDATE profile Candidate owner tác động đúng một row thật');
  UPDATE public.users SET phone = 'spoof' WHERE id = '00000000-0000-4000-8000-000000000602';
  GET DIAGNOSTICS affected = ROW_COUNT;
  PERFORM pg_temp.assert_true(affected = 0, 'RLS chặn UPDATE user khác owner');
  UPDATE public.candidate_profiles SET bio = 'spoof' WHERE user_id = '00000000-0000-4000-8000-000000000602';
  GET DIAGNOSTICS affected = ROW_COUNT;
  PERFORM pg_temp.assert_true(affected = 0, 'Chặn UPDATE profile Candidate khác owner');
  UPDATE public.employer_profiles SET company_name = 'spoof' WHERE user_id = '00000000-0000-4000-8000-000000000602';
  GET DIAGNOSTICS affected = ROW_COUNT;
  PERFORM pg_temp.assert_true(affected = 0, 'Chặn UPDATE profile Employer khác owner');
  UPDATE public.employer_profiles SET company_name = 'spoof' WHERE user_id = '00000000-0000-4000-8000-000000000601';
  GET DIAGNOSTICS affected = ROW_COUNT;
  PERFORM pg_temp.assert_true(affected = 0, 'Candidate không được UPDATE profile Employer của mình');
END $$;
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.users WHERE phone = '006-A'), 'UPDATE user owner lưu đúng giá trị');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.candidate_profiles WHERE bio = 'auth006-updated-bio'), 'UPDATE Candidate owner lưu đúng giá trị');
DO $$ BEGIN
  BEGIN UPDATE public.users SET role = 'ADMIN'; RAISE EXCEPTION 'FAIL: tự nâng quyền'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.users SET auth_user_id = '00000000-0000-4000-8000-000000000602'; RAISE EXCEPTION 'FAIL: đổi binding'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.candidate_profiles SET trust_battery = 100; RAISE EXCEPTION 'FAIL: sửa trust'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.users SET kyc_id_number = 'spoof' WHERE id = '00000000-0000-4000-8000-000000000601'; RAISE EXCEPTION 'FAIL: sửa KYC'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.users SET is_kyc_verified = true WHERE id = '00000000-0000-4000-8000-000000000601'; RAISE EXCEPTION 'FAIL: tự xác minh KYC'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM kyc_id_number FROM public.users; RAISE EXCEPTION 'FAIL: đọc KYC number'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.candidate_profiles SET total_shifts_completed = 10; RAISE EXCEPTION 'FAIL: sửa tổng ca'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.candidate_profiles SET party_streak = 10; RAISE EXCEPTION 'FAIL: sửa streak'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.set_employer_role('00000000-0000-4000-8000-000000000601',true); RAISE EXCEPTION 'FAIL: RPC không Admin'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.messages(id,conversation_id,sender_id,sender_name,content) VALUES ('auth006-spoof','auth006-chat','00000000-0000-4000-8000-000000000602','B','spoof'); RAISE EXCEPTION 'FAIL: giả sender'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.messages(id,conversation_id,sender_id,sender_name,content) VALUES ('auth006-leak','auth006-private','00000000-0000-4000-8000-000000000601','A','leak'); RAISE EXCEPTION 'FAIL: gửi hội thoại riêng'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.messages(id,conversation_id,sender_id,sender_name,content) VALUES ('auth006-message-name','auth006-chat','00000000-0000-4000-8000-000000000601','B','spoof'); RAISE EXCEPTION 'FAIL: giả tên message'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.messages(id,conversation_id,sender_id,sender_name,sender_avatar,content) VALUES ('auth006-message-avatar','auth006-chat','00000000-0000-4000-8000-000000000601','A','https://spoof.test.invalid/avatar','spoof'); RAISE EXCEPTION 'FAIL: giả avatar message'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM 1 FROM public.escrow_transactions; RAISE EXCEPTION 'FAIL: đọc tài chính'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.employer_profiles SET escrow_balance = 100; RAISE EXCEPTION 'FAIL: sửa tài chính'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.shifts(id, employer_id, employer_name,title,shift_start,shift_end,latitude,longitude,location_address) VALUES ('auth006-candidate','00000000-0000-4000-8000-000000000601','A','Ca','18:00','20:00',0,0,'Test'); RAISE EXCEPTION 'FAIL: Candidate đăng ca'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
INSERT INTO public.messages(id,conversation_id,sender_id,sender_name,content) VALUES
 ('auth006-own-msg','auth006-chat','00000000-0000-4000-8000-000000000601','A','Tin đúng');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.messages WHERE id = 'auth006-own-msg' AND sender_name = 'A' AND content = 'Tin đúng'), 'Member đọc được tin mình vừa INSERT');
DELETE FROM public.messages WHERE id = 'auth006-private-msg';
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.messages WHERE id = 'auth006-private-msg'), 'Tin riêng không hiện');

SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000602',true);
SELECT pg_temp.assert_true((SELECT count(*) = 2 FROM public.conversations WHERE id IN ('auth006-chat','auth006-private')), 'B đọc được cả hai hội thoại thành viên');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.messages WHERE id = 'auth006-own-msg'), 'B đọc được tin thành viên khác');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.shifts WHERE id = 'auth006-private-shift'), 'Employer đọc được ca của mình');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.shift_applications WHERE id = 'auth006-private-application'), 'Employer đọc được ứng tuyển ca của mình');
DO $$ DECLARE affected INTEGER; BEGIN
  UPDATE public.employer_profiles SET company_name = 'auth006-company-b-updated' WHERE user_id = '00000000-0000-4000-8000-000000000602';
  GET DIAGNOSTICS affected = ROW_COUNT;
  PERFORM pg_temp.assert_true(affected = 1, 'UPDATE profile Employer owner tác động đúng một row thật');
  UPDATE public.employer_profiles SET address = 'spoof' WHERE user_id = '00000000-0000-4000-8000-000000000601';
  GET DIAGNOSTICS affected = ROW_COUNT;
  PERFORM pg_temp.assert_true(affected = 0, 'Employer không UPDATE được profile owner khác');
END $$;
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.employer_profiles WHERE company_name = 'auth006-company-b-updated'), 'UPDATE profile Employer lưu đúng giá trị');
DO $$ BEGIN
  BEGIN UPDATE public.employer_profiles SET verified_badge = true WHERE user_id = '00000000-0000-4000-8000-000000000602'; RAISE EXCEPTION 'FAIL: sửa verified badge'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.employer_profiles SET checkin_pin = 'spoof' WHERE user_id = '00000000-0000-4000-8000-000000000602'; RAISE EXCEPTION 'FAIL: sửa PIN'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM checkin_pin FROM public.employer_profiles; RAISE EXCEPTION 'FAIL: đọc PIN'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM escrow_balance FROM public.employer_profiles; RAISE EXCEPTION 'FAIL: đọc balance'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.employer_profiles SET escrow_balance = 100 WHERE user_id = '00000000-0000-4000-8000-000000000602'; RAISE EXCEPTION 'FAIL: sửa owner balance'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.escrow_transactions(id,code,title,amount) VALUES ('auth006-spoof-financial','auth006-spoof-code','Spoof',1); RAISE EXCEPTION 'FAIL: ghi tài chính'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.escrow_transactions SET amount = 1 WHERE id = 'auth006-financial'; RAISE EXCEPTION 'FAIL: sửa ledger'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN DELETE FROM public.escrow_transactions WHERE id = 'auth006-financial'; RAISE EXCEPTION 'FAIL: xóa ledger'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
DO $$ BEGIN
  BEGIN INSERT INTO public.shifts(id, employer_id, employer_name,title,shift_start,shift_end,latitude,longitude,location_address) VALUES ('auth006-spoof-shift','00000000-0000-4000-8000-000000000601','A','Ca','18:00','20:00',0,0,'Test'); RAISE EXCEPTION 'FAIL: giả owner ca'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.shifts(id, employer_id, employer_name,title,shift_start,shift_end,latitude,longitude,location_address) VALUES ('auth006-spoof-name','00000000-0000-4000-8000-000000000602','Admin','Ca','18:00','20:00',0,0,'Test'); RAISE EXCEPTION 'FAIL: giả tên Employer'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.shifts(id, employer_id, employer_name,employer_avatar,title,shift_start,shift_end,latitude,longitude,location_address) VALUES ('auth006-spoof-avatar','00000000-0000-4000-8000-000000000602','B','https://spoof.test.invalid/avatar','Ca','18:00','20:00',0,0,'Test'); RAISE EXCEPTION 'FAIL: giả avatar Employer'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  -- Danh tính B đúng hồ sơ hiện tại; chỉ lifecycle field vi phạm.
  BEGIN INSERT INTO public.shifts(id,employer_id,employer_name,employer_avatar,title,shift_start,shift_end,latitude,longitude,location_address,status) VALUES ('auth006-completed-shift','00000000-0000-4000-8000-000000000602','B','','Ca','18:00','20:00',0,0,'Test','COMPLETED'); RAISE EXCEPTION 'FAIL: INSERT ca COMPLETED'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.shifts(id,employer_id,employer_name,employer_avatar,title,shift_start,shift_end,latitude,longitude,location_address,filled_candidates) VALUES ('auth006-filled-shift','00000000-0000-4000-8000-000000000602','B','','Ca','18:00','20:00',0,0,'Test',1); RAISE EXCEPTION 'FAIL: INSERT ca có filled_candidates'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
INSERT INTO public.shifts(id, employer_id, employer_name,title,shift_start,shift_end,latitude,longitude,location_address)
VALUES ('auth006-shift','00000000-0000-4000-8000-000000000602','B','Ca','18:00','20:00',0,0,'Test');
DO $$ BEGIN
  BEGIN INSERT INTO public.shifts(id, employer_id, employer_name,title,shift_start,shift_end,latitude,longitude,location_address) VALUES ('auth006-shift','00000000-0000-4000-8000-000000000602','B','Ca','18:00','20:00',0,0,'Test'); RAISE EXCEPTION 'FAIL: ID trùng'; EXCEPTION WHEN unique_violation THEN NULL; END;
END $$;
UPDATE public.users SET avatar_url = 'https://profile.test.invalid/b' WHERE id = '00000000-0000-4000-8000-000000000602';
INSERT INTO public.shifts(id, employer_id, employer_name,employer_avatar,title,shift_start,shift_end,latitude,longitude,location_address)
VALUES ('auth006-profile-shift','00000000-0000-4000-8000-000000000602','B','https://profile.test.invalid/b','Ca','18:00','20:00',0,0,'Test');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.shifts WHERE id = 'auth006-profile-shift'), 'Cho phép danh tính khớp hồ sơ có avatar');
DELETE FROM public.messages WHERE id = 'auth006-own-msg';
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.messages WHERE id = 'auth006-own-msg'), 'Không xóa tin của A');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.messages WHERE id = 'auth006-private-msg'), 'Tin riêng vẫn tồn tại sau DELETE của A');
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000601',true);
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.shifts), 'Không đọc ca riêng của B');
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.shift_applications), 'Ứng tuyển riêng không lộ');
DELETE FROM public.messages WHERE id = 'auth006-own-msg';
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.messages), 'Sender xóa tin mình');

-- Provision fixture ứng tuyển sau khi giữ nguyên các tests đọc riêng ban đầu.
RESET ROLE;
INSERT INTO public.shifts(id,employer_id,employer_name,title,shift_start,shift_end,latitude,longitude,location_address)
VALUES ('auth006-applied-shift','00000000-0000-4000-8000-000000000602','B','Applied fixture','18:00','20:00',0,0,'Test');
INSERT INTO public.shift_applications(id,shift_id,candidate_id)
VALUES ('auth006-applied-application','auth006-applied-shift','00000000-0000-4000-8000-000000000601');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.users WHERE id = '00000000-0000-4000-8000-000000000602' AND phone = ''), 'User B không đổi sau UPDATE khác owner');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.candidate_profiles WHERE user_id = '00000000-0000-4000-8000-000000000602' AND bio = ''), 'Profile Candidate B không bị A đổi');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.employer_profiles WHERE user_id = '00000000-0000-4000-8000-000000000601' AND company_name = 'auth006-company-a' AND address = 'Test A'), 'Profile Employer A không đổi sau UPDATE bị chặn');
SET LOCAL ROLE authenticated;
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.shifts WHERE id = 'auth006-applied-shift'), 'Candidate đọc được ca đã ứng tuyển');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.shift_applications WHERE id = 'auth006-applied-application'), 'Candidate đọc được ứng tuyển của mình');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.shifts), 'Quyền đọc ca đã ứng tuyển không làm lộ ca khác');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.shift_applications), 'Quyền đọc ứng tuyển mình không làm lộ ứng tuyển khác');
DO $$ BEGIN
  BEGIN INSERT INTO public.shift_applications(id,shift_id,candidate_id) VALUES ('auth006-forbidden-application','auth006-applied-shift','00000000-0000-4000-8000-000000000601'); RAISE EXCEPTION 'FAIL: INSERT application'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.shift_applications SET status = 'COMPLETED' WHERE id = 'auth006-applied-application'; RAISE EXCEPTION 'FAIL: UPDATE application'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN DELETE FROM public.shift_applications WHERE id = 'auth006-applied-application'; RAISE EXCEPTION 'FAIL: DELETE application'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.shifts SET status = 'COMPLETED' WHERE id = 'auth006-applied-shift'; RAISE EXCEPTION 'FAIL: UPDATE shift'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN DELETE FROM public.shifts WHERE id = 'auth006-applied-shift'; RAISE EXCEPTION 'FAIL: DELETE shift'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.conversations(id,candidate_id,employer_id) VALUES ('auth006-forbidden-chat','00000000-0000-4000-8000-000000000601','00000000-0000-4000-8000-000000000602'); RAISE EXCEPTION 'FAIL: INSERT conversation'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.conversations SET employer_id = '00000000-0000-4000-8000-000000000603' WHERE id = 'auth006-chat'; RAISE EXCEPTION 'FAIL: UPDATE conversation'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN DELETE FROM public.conversations WHERE id = 'auth006-chat'; RAISE EXCEPTION 'FAIL: DELETE conversation'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.messages SET content = 'spoof' WHERE id = 'auth006-private-msg'; RAISE EXCEPTION 'FAIL: UPDATE message'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;

-- Fixture mapping: Auth thật vẫn kích hoạt signup; provision tin cậy đổi app ID
-- sau khi gỡ FK profile, rồi dựng lại profile với app ID khác Auth UUID.
RESET ROLE;
INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES
 ('00000000-0000-4000-8000-000000000604','auth006-mapped@test.invalid','{"full_name":"Mapped"}');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.users WHERE id = '00000000-0000-4000-8000-000000000604' AND auth_user_id = '00000000-0000-4000-8000-000000000604'), 'Signup mapping fixture tạo user thật');
DELETE FROM public.candidate_profiles WHERE user_id = '00000000-0000-4000-8000-000000000604';
UPDATE public.users SET id = 'auth006-mapped-user', role = 'EMPLOYER' WHERE auth_user_id = '00000000-0000-4000-8000-000000000604';
INSERT INTO public.candidate_profiles(user_id) VALUES ('auth006-mapped-user');
INSERT INTO public.employer_profiles(user_id,company_name,address) VALUES ('auth006-mapped-user','auth006-mapped-company','Test');
INSERT INTO public.shifts(id,employer_id,employer_name,title,shift_start,shift_end,latitude,longitude,location_address)
VALUES ('auth006-mapped-shift','auth006-mapped-user','Mapped','Ca mapping','18:00','20:00',0,0,'Test');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000604',true);
SELECT pg_temp.assert_true(public.current_app_user_id() = 'auth006-mapped-user', 'Binding trả app ID khác Auth UUID');
SELECT pg_temp.assert_true(public.owns_shift('auth006-mapped-shift'), 'Ownership dùng app ID đã mapping');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.users WHERE id = 'auth006-mapped-user'), 'Mapped user đọc profile mình');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.candidate_profiles WHERE user_id = 'auth006-mapped-user'), 'Mapped user đọc Candidate profile bằng app ID');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.shifts WHERE id = 'auth006-mapped-shift'), 'Mapped owner đọc ca bằng app ID');
DO $$ DECLARE affected INTEGER; BEGIN
  UPDATE public.employer_profiles SET company_name = 'auth006-mapped-updated' WHERE user_id = 'auth006-mapped-user';
  GET DIAGNOSTICS affected = ROW_COUNT;
  PERFORM pg_temp.assert_true(affected = 1, 'Mapped owner UPDATE đúng profile');
END $$;
INSERT INTO public.shifts(id,employer_id,employer_name,title,shift_start,shift_end,latitude,longitude,location_address)
VALUES ('auth006-mapped-insert','auth006-mapped-user','Mapped','Ca mapping mới','18:00','20:00',0,0,'Test');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.shifts WHERE id = 'auth006-mapped-insert'), 'Mapped owner INSERT ca bằng app ID');
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.employer_profiles WHERE user_id = 'auth006-mapped-user' AND company_name = 'auth006-mapped-updated'), 'Mapped owner UPDATE lưu đúng giá trị');

SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000603',true);
SELECT public.set_employer_role('00000000-0000-4000-8000-000000000601', true);
DO $$ BEGIN
  BEGIN PERFORM public.set_employer_role('00000000-0000-4000-8000-000000000603',false); RAISE EXCEPTION 'FAIL: đổi Admin'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.set_employer_role('auth006-demo',true); RAISE EXCEPTION 'FAIL: liên kết DEMO'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000601',true);
SELECT pg_temp.assert_true(public.current_app_role() = 'EMPLOYER', 'Session tiếp theo đọc quyền mới');
DO $$ DECLARE affected INTEGER; BEGIN
  UPDATE public.employer_profiles SET company_name = 'auth006-company-a-updated' WHERE user_id = '00000000-0000-4000-8000-000000000601';
  GET DIAGNOSTICS affected = ROW_COUNT;
  PERFORM pg_temp.assert_true(affected = 1, 'A được cấp Employer UPDATE được profile mình');
END $$;
SELECT pg_temp.assert_true((SELECT count(*) = 1 FROM public.employer_profiles WHERE company_name = 'auth006-company-a-updated'), 'UPDATE Employer sau cấp quyền lưu đúng giá trị');
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000603',true);
SELECT public.set_employer_role('00000000-0000-4000-8000-000000000601', false);
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000601',true);
SELECT pg_temp.assert_true(public.current_app_role() = 'CANDIDATE', 'Thu hồi quyền hiệu lực');
DO $$ DECLARE affected INTEGER; BEGIN
  UPDATE public.employer_profiles SET company_name = 'spoof-revoked' WHERE user_id = '00000000-0000-4000-8000-000000000601';
  GET DIAGNOSTICS affected = ROW_COUNT;
  PERFORM pg_temp.assert_true(affected = 0, 'Sau revoke không UPDATE Employer profile');
  BEGIN INSERT INTO public.shifts(id,employer_id,employer_name,title,shift_start,shift_end,latitude,longitude,location_address) VALUES ('auth006-revoked-shift','00000000-0000-4000-8000-000000000601','A','Ca','18:00','20:00',0,0,'Test'); RAISE EXCEPTION 'FAIL: đăng ca sau revoke'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub','',true);
SELECT pg_temp.assert_true((SELECT count(*) = 0 FROM public.users), 'Không session không có hồ sơ');
SET LOCAL ROLE anon;
DO $$ BEGIN
  BEGIN PERFORM 1 FROM public.users; RAISE EXCEPTION 'FAIL: anon đọc users'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM 1 FROM public.candidate_profiles; RAISE EXCEPTION 'FAIL: anon đọc candidate_profiles'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM 1 FROM public.employer_profiles; RAISE EXCEPTION 'FAIL: anon đọc employer_profiles'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM 1 FROM public.shifts; RAISE EXCEPTION 'FAIL: anon đọc shifts'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM 1 FROM public.shift_applications; RAISE EXCEPTION 'FAIL: anon đọc applications'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM 1 FROM public.conversations; RAISE EXCEPTION 'FAIL: anon đọc conversations'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM 1 FROM public.messages; RAISE EXCEPTION 'FAIL: anon đọc messages'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM 1 FROM public.escrow_transactions; RAISE EXCEPTION 'FAIL: anon đọc escrow'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.current_app_user_id(); RAISE EXCEPTION 'FAIL: anon helper user'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.current_app_role(); RAISE EXCEPTION 'FAIL: anon helper role'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.is_conversation_member('auth006-chat'); RAISE EXCEPTION 'FAIL: anon helper member'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.owns_shift('auth006-private-shift'); RAISE EXCEPTION 'FAIL: anon helper owner'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.applied_to_shift('auth006-applied-shift'); RAISE EXCEPTION 'FAIL: anon helper application'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.set_employer_role('00000000-0000-4000-8000-000000000601',true); RAISE EXCEPTION 'FAIL: anon RPC'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
ROLLBACK;
-- RESET ROLE và rollback khôi phục quyền đọc đặc quyền cho hậu kiểm.
\ir 006_verify_rollback.sql
