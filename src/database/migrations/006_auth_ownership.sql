-- Chỉ review trên database test đã được duyệt; không chạy trên môi trường hiện có.
BEGIN;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
-- DEMO giữ auth_user_id NULL. Không liên kết theo email hoặc dữ liệu seed.

CREATE TABLE IF NOT EXISTS public.conversations (
  id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  candidate_id VARCHAR(50) NOT NULL REFERENCES public.users(id),
  employer_id VARCHAR(50) NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (candidate_id <> employer_id)
);
CREATE TABLE IF NOT EXISTS public.messages (
  id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id VARCHAR(50) NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id VARCHAR(50) NOT NULL REFERENCES public.users(id),
  sender_name VARCHAR(100) NOT NULL,
  sender_avatar TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL CHECK (length(btrim(content)) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_conversation_created ON public.messages(conversation_id, created_at);

CREATE OR REPLACE FUNCTION public.current_app_user_id() RETURNS VARCHAR
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT id FROM public.users WHERE auth_user_id = auth.uid()
$$;
CREATE OR REPLACE FUNCTION public.current_app_role() RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT role FROM public.users WHERE auth_user_id = auth.uid()
$$;
CREATE OR REPLACE FUNCTION public.is_conversation_member(conversation VARCHAR) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversations c
    WHERE c.id = conversation AND public.current_app_user_id() IN (c.candidate_id, c.employer_id))
$$;
CREATE OR REPLACE FUNCTION public.owns_shift(shift VARCHAR) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.shifts s WHERE s.id = shift AND s.employer_id = public.current_app_user_id())
$$;
CREATE OR REPLACE FUNCTION public.applied_to_shift(shift VARCHAR) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.shift_applications a WHERE a.shift_id = shift AND a.candidate_id = public.current_app_user_id())
$$;

CREATE OR REPLACE FUNCTION public.handle_auth_signup() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.users(id, auth_user_id, email, phone, full_name, role, is_kyc_verified)
  VALUES (NEW.id::text, NEW.id, NEW.email, '',
    left(coalesce(nullif(btrim(NEW.raw_user_meta_data->>'full_name'), ''), 'Thành viên'), 100),
    'CANDIDATE', false);
  INSERT INTO public.candidate_profiles(user_id, bio, university, skills, weekly_availability, latitude, longitude, location_address)
  VALUES (NEW.id::text, '', '', '[]'::jsonb, '{}'::jsonb, 0, 0, '');
  RETURN NEW;
END
$$;
DROP TRIGGER IF EXISTS selltime_auth_signup ON auth.users;
CREATE TRIGGER selltime_auth_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_auth_signup();

CREATE OR REPLACE FUNCTION public.set_employer_role(target_user_id VARCHAR, enabled BOOLEAN) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE target_role public.user_role;
BEGIN
  IF public.current_app_role() IS DISTINCT FROM 'ADMIN'::public.user_role THEN
    RAISE EXCEPTION 'Chỉ Admin đã xác minh được cấp quyền' USING ERRCODE = '42501';
  END IF;
  IF enabled IS NULL THEN RAISE EXCEPTION 'Thiếu trạng thái quyền' USING ERRCODE = '42501'; END IF;
  SELECT role INTO target_role FROM public.users WHERE id = target_user_id AND auth_user_id IS NOT NULL FOR UPDATE;
  IF target_role IS NULL OR target_role = 'ADMIN' THEN
    RAISE EXCEPTION 'Không được thay đổi Admin hoặc DEMO' USING ERRCODE = '42501';
  END IF;
  UPDATE public.users SET role = CASE WHEN enabled THEN 'EMPLOYER'::public.user_role ELSE 'CANDIDATE'::public.user_role END,
    updated_at = now() WHERE id = target_user_id;
END
$$;

-- Xóa các policy cũ để tránh permissive policy cộng OR làm mở quyền.
DO $$
DECLARE p RECORD; t TEXT;
BEGIN
  FOR p IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public'
    AND tablename IN ('users','candidate_profiles','employer_profiles','shifts','shift_applications','conversations','messages','escrow_transactions')
  LOOP EXECUTE format('DROP POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename); END LOOP;
  FOREACH t IN ARRAY ARRAY['users','candidate_profiles','employer_profiles','shifts','shift_applications','conversations','messages','escrow_transactions']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated', t);
  END LOOP;
END $$;

GRANT SELECT(id, auth_user_id, email, phone, full_name, role, avatar_url, is_kyc_verified, created_at, updated_at) ON public.users TO authenticated;
GRANT UPDATE(full_name, avatar_url, phone) ON public.users TO authenticated;
CREATE POLICY users_self_read ON public.users FOR SELECT TO authenticated USING (auth_user_id = auth.uid());
CREATE POLICY users_self_update ON public.users FOR UPDATE TO authenticated USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());

GRANT SELECT ON public.candidate_profiles TO authenticated;
GRANT UPDATE(bio, university, hourly_rate_min, skills, weekly_availability, latitude, longitude, location_address) ON public.candidate_profiles TO authenticated;
CREATE POLICY candidate_self_read ON public.candidate_profiles FOR SELECT TO authenticated USING (user_id = public.current_app_user_id());
CREATE POLICY candidate_self_update ON public.candidate_profiles FOR UPDATE TO authenticated USING (user_id = public.current_app_user_id()) WITH CHECK (user_id = public.current_app_user_id());
GRANT SELECT(user_id, company_name, business_type, address, latitude, longitude, verified_badge, updated_at) ON public.employer_profiles TO authenticated;
GRANT UPDATE(company_name, business_type, address, latitude, longitude) ON public.employer_profiles TO authenticated;
CREATE POLICY employer_self_read ON public.employer_profiles FOR SELECT TO authenticated USING (user_id = public.current_app_user_id());
CREATE POLICY employer_self_update ON public.employer_profiles FOR UPDATE TO authenticated USING (user_id = public.current_app_user_id() AND public.current_app_role() = 'EMPLOYER') WITH CHECK (user_id = public.current_app_user_id() AND public.current_app_role() = 'EMPLOYER');

GRANT SELECT, INSERT ON public.shifts TO authenticated;
CREATE POLICY shifts_private_read ON public.shifts FOR SELECT TO authenticated USING (employer_id = public.current_app_user_id() OR public.applied_to_shift(id));
CREATE POLICY shifts_owner_insert ON public.shifts FOR INSERT TO authenticated WITH CHECK (
  employer_id = public.current_app_user_id() AND public.current_app_role() = 'EMPLOYER'
  AND status = 'OPEN' AND filled_candidates = 0
  AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = employer_id AND u.auth_user_id IS NOT NULL
    AND employer_name = u.full_name
    AND coalesce(employer_avatar, '') = coalesce(u.avatar_url, ''))
);
-- Không cấp UPDATE/DELETE ca, ứng tuyển hoặc trạng thái lifecycle trong iteration này.
GRANT SELECT ON public.shift_applications TO authenticated;
CREATE POLICY applications_private_read ON public.shift_applications FOR SELECT TO authenticated USING (candidate_id = public.current_app_user_id() OR public.owns_shift(shift_id));
GRANT SELECT ON public.conversations TO authenticated;
CREATE POLICY conversations_member_read ON public.conversations FOR SELECT TO authenticated USING (public.current_app_user_id() IN (candidate_id, employer_id));
GRANT SELECT, INSERT, DELETE ON public.messages TO authenticated;
CREATE POLICY messages_member_read ON public.messages FOR SELECT TO authenticated USING (public.is_conversation_member(conversation_id));
CREATE POLICY messages_member_insert ON public.messages FOR INSERT TO authenticated WITH CHECK (
  public.is_conversation_member(conversation_id) AND sender_id = public.current_app_user_id()
  AND sender_name = (SELECT full_name FROM public.users WHERE id = public.current_app_user_id())
  AND sender_avatar = coalesce((SELECT avatar_url FROM public.users WHERE id = public.current_app_user_id()), '')
);
CREATE POLICY messages_sender_delete ON public.messages FOR DELETE TO authenticated USING (public.is_conversation_member(conversation_id) AND sender_id = public.current_app_user_id());
-- escrow_transactions không có policy/grant: khóa tài chính cả đọc và ghi.

REVOKE ALL ON FUNCTION public.current_app_user_id(), public.current_app_role(), public.is_conversation_member(VARCHAR), public.owns_shift(VARCHAR), public.applied_to_shift(VARCHAR), public.set_employer_role(VARCHAR, BOOLEAN), public.handle_auth_signup() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_app_user_id(), public.current_app_role(), public.is_conversation_member(VARCHAR), public.owns_shift(VARCHAR), public.applied_to_shift(VARCHAR), public.set_employer_role(VARCHAR, BOOLEAN) TO authenticated;
COMMIT;
