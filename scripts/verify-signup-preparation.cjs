'use strict';
// Chỉ đọc file/catalog artifact tĩnh; không gọi SQL/provider/network/credential.
// PASS STATIC chỉ là coverage cấu trúc, KHÔNG xác minh PostgreSQL syntax/runtime.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8').replace(/\r\n/g, '\n');
const migration = read('src/database/migrations/007_auth_email_uniqueness.sql');
const rollback = read('src/database/tests/007_rollback.sql');
const suite = read('src/database/tests/007_signup_collision.sql');
const residue = read('src/database/tests/007_verify_residue.sql');
const unicode = read('src/database/tests/007_environment_and_unicode.sql');
const scenarios = read('src/database/tests/007_runtime_scenarios.md');
const docs = read('docs/signup-collision-offline.md');
const expectedIndex = 'CREATE UNIQUE INDEX users_auth_email_lower_uidx ON public.users USING btree (lower((email)::text)) WHERE (auth_user_id IS NOT NULL)';
const required = (s, fragment) => assert.ok(s.includes(fragment), `Thiếu coverage tĩnh: ${fragment}`);
const before = (s, a, b) => { required(s, a); required(s, b); assert.ok(s.indexOf(a) < s.indexOf(b), `Sai thứ tự: ${a} trước ${b}`); };
for (const sql of [migration, rollback]) {
  assert.equal((sql.match(/^BEGIN;/gm) || []).length, 1);
  assert.equal((sql.match(/^COMMIT;/gm) || []).length, 1);
  for (const fragment of ["SET LOCAL lock_timeout = '5s';", 'SET LOCAL row_security = off;',
    'LOCK TABLE auth.users IN SHARE ROW EXCLUSIVE MODE;', 'LOCK TABLE public.users IN ACCESS EXCLUSIVE MODE;', expectedIndex]) required(sql, fragment);
  before(sql, 'LOCK TABLE auth.users', 'LOCK TABLE public.users');
  assert.ok(!/\b(?:DROP\s+\w+[^;]*\bCASCADE|CREATE\s+INDEX\s+CONCURRENTLY|DELETE\s+FROM|UPDATE\s+public\.|TRUNCATE\s+|ALTER\s+.*COLLATE)\b/i.test(sql));
}
for (const fragment of ['atttypmod = 124', "atttypid = 'uuid'::regtype", "confdeltype = 'c'", 'pg_collation_actual_version',
  'GROUP BY lower(email) HAVING count(*) > 1', 'a.email IS DISTINCT FROM u.email', 'public.candidate_profiles',
  'pg_get_constraintdef(old_constraint.oid)', 'pg_depend', 'ANY(confkey)', 'p.prosrc', 'indisvalid', 'indnkeyatts',
  "proconfig = ARRAY['search_path=\"\"']", 'SECURITY DEFINER', 'IS DISTINCT FROM guarded_body']) required(migration, fragment);
before(migration, 'GROUP BY lower(email)', 'CREATE UNIQUE INDEX users_auth_email_lower_uidx ON public.users (lower(email))');
before(migration, 'CREATE UNIQUE INDEX users_auth_email_lower_uidx ON public.users (lower(email))', 'ALTER TABLE public.users DROP CONSTRAINT %I');
before(migration, 'dependency email chưa được xử lý', 'CREATE UNIQUE INDEX users_auth_email_lower_uidx ON public.users (lower(email))');
const old = read('src/database/migrations/006_auth_ownership.sql');
const originalBody = old.match(/FUNCTION public\.handle_auth_signup\(\)[\s\S]*?AS \$\$([\s\S]*?)\$\$;/)[1];
const baseline = migration.split('$baseline$')[1], prefix = migration.split('$guard$')[1];
assert.equal(baseline, originalBody, '007 snapshot phải nguyên văn function 006');
const guarded = prefix + baseline.slice(baseline.indexOf('INSERT INTO'));
assert.ok(!migration.includes('\\0085'), 'Không thêm explicit U+0085 exclusion khác policy JS hiện có');
const md5 = s => crypto.createHash('md5').update(s).digest('hex');
required(rollback, md5(baseline)); required(rollback, md5(guarded));
assert.ok(!/NEW\.email\s*:=|lower\(NEW\.email\)|trim\(NEW\.email\)/i.test(prefix));
for (const fragment of ['NEW.email IS NULL', 'length(NEW.email) > 120', "ERRCODE = '23514'", "'CANDIDATE', false", 'NEW.id::text, NEW.id, NEW.email']) required(migration, fragment);
before(rollback, 'GROUP BY email HAVING count(*) > 1', 'ALTER TABLE public.users ADD CONSTRAINT %I UNIQUE (email)');
before(rollback, 'ALTER TABLE public.users ADD CONSTRAINT %I UNIQUE (email)', 'DROP INDEX public.users_auth_email_lower_uidx');
for (const fragment of ["ERRCODE='23505'", "metadata->>'constraint_name'", "metadata->>'baseline_body'", 'pg_depend']) required(rollback, fragment);
assert.equal((suite.match(/^BEGIN;/gm) || []).length, 1); assert.equal((suite.match(/^ROLLBACK;/gm) || []).length, 1);
assert.ok(!/^COMMIT;/m.test(suite));
assert.equal(suite.split('\\ir 007_verify_residue.sql').length - 1, 2);
for (const fragment of ['EXCEPT ALL', 'unique_violation', 'check_violation', 'not_null_violation', 'string_data_right_truncation',
  'AND NOT EXISTS(SELECT 1 FROM public.candidate_profiles', 'SET LOCAL ROLE authenticated', 'NOT rolsuper AND NOT rolbypassrls',
  'public.current_app_user_id()', 'public.current_app_role()', 'public.employer_profiles', 'public.shifts', 'public.conversations', 'public.messages']) required(suite, fragment);
for (const sql of [residue, unicode]) {
  required(sql, 'BEGIN READ ONLY;'); required(sql, 'SET LOCAL row_security = off;');
  assert.ok(!/^\s*(?:INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE)\b/im.test(sql));
}
for (const fragment of ['Supabase Auth', '55P03', '23505', '42501', 'DEFERRABLE', 'NFKC', 'NOT RUN', 'CAP-4']) required(scenarios, fragment);
for (const fragment of ['CAP-1', 'CAP-2', 'CAP-3', 'CAP-4', 'NOT RUN', 'npm run build', '000_test_baseline.sql']) required(docs, fragment);
const protectedFiles = JSON.parse(read('_bmad-output/implementation-artifacts/verification-6-signup-offline/preserved-before.json'));
for (const item of protectedFiles) {
  const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, item.path))).digest('hex').toUpperCase();
  assert.equal(actual, item.sha256, `Đã sửa file ngoài scope: ${item.path}`);
}
console.log('PASS STATIC: CAP-1 collision/UUID/default/RLS artifacts; CAP-2 boundary/provider-mock/duplicate/concurrency artifacts.');
console.log('PASS STATIC: CAP-3 lock/recheck/dependencies/shape/definition/atomic order; CAP-4 conditional rollback/order/body hash.');
console.log(`PASS PRESERVATION: ${protectedFiles.length} file đã giữ SHA256; HEAD/index kiểm tra riêng trong evidence.`);
console.log('SQL syntax/runtime, trigger/RLS/provider/concurrency/Unicode parity: NOT RUN. Static markers không thay thế SQL integration.');
