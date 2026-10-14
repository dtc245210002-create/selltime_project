-- Read-only diagnostic, NOT RUN; không chứng minh provider parity.
-- Ghi thêm phiên bản Supabase Auth/Go/settings ngoài SQL sau approval.
\set ON_ERROR_STOP on
BEGIN READ ONLY;
SET LOCAL row_security = off;
SELECT current_setting('server_version') AS postgres_version,
  current_setting('server_encoding') AS encoding,
  current_setting('lc_ctype') AS lc_ctype,
  current_setting('lc_collate') AS lc_collate;
SELECT extname,extversion FROM pg_extension ORDER BY extname;
SELECT c.collname,c.collprovider,c.collisdeterministic,c.collversion,
  pg_collation_actual_version(c.oid) AS actual_version
FROM pg_attribute a JOIN pg_collation c ON c.oid=a.attcollation
WHERE a.attrelid='public.users'::regclass AND a.attname='email';
-- Cùng collation email; output chỉ fixture, không đọc email thật.
SELECT sample,lower(sample COLLATE "default") AS pg_lower_default,
  encode(convert_to(lower(sample COLLATE "default"),'UTF8'),'hex') AS utf8_lower
FROM (VALUES ('Auth007-Mixed@Test.Invalid'),('I@test.invalid'),(U&'\0130@test.invalid'),
 (U&'\0131@test.invalid'),(U&'\00E9@test.invalid'),(U&'e\0301@test.invalid'),
 (U&'\00A0auth007-space@test.invalid\00A0'),(U&'auth007-\3000@test.invalid')) fixture(sample);
-- Nếu email collation khác default: HALT phép so parity này; cần query cùng collation được duyệt.
DO $$ BEGIN
  IF (SELECT attcollation FROM pg_attribute WHERE attrelid='public.users'::regclass AND attname='email')
      IS DISTINCT FROM '"default"'::regcollation::oid THEN
    RAISE EXCEPTION 'HALT: diagnostic default không cùng collation email; cần kế hoạch riêng';
  END IF;
END $$;
COMMIT;
