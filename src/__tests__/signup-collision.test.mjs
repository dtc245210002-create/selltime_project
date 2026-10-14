// Route/server/policy THẬT transpile; provider stub, không mô phỏng SQL uniqueness/trigger/RLS.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const cache = new Map(), calls = [], lookups = [];
const originalEnv = { ...process.env }, originalFetch = globalThis.fetch;
let mode = 'session';
const profile = { id: 'auth007-candidate', auth_user_id: 'auth007-uuid', role: 'CANDIDATE', full_name: 'Auth test', email: 'auth007-demo@test.invalid', avatar_url: '' };
const demo = { id: 'auth007-demo', auth_user_id: null, role: 'EMPLOYER', email: profile.email, is_kyc_verified: true };
const snapshot = structuredClone(demo);
function provider() {
  const result = () => mode === 'duplicate' || mode === 'other-error'
    ? { data: { session: null }, error: { message: mode === 'duplicate' ? 'Account already exists (private)' : 'Provider detail (private)', code: mode } }
    : { data: { session: mode === 'confirmation' || mode === 'concealed-duplicate' ? null : { access_token: 'auth007-token', refresh_token: 'auth007-refresh', expires_in: 60 } }, error: null };
  return {
    auth: {
      signUp: async args => { calls.push({ action: 'signup', args }); return result(); },
      signInWithPassword: async args => { calls.push({ action: 'login', args }); return result(); },
      getUser: async token => { assert.equal(token, 'auth007-token'); return { data: { user: { id: profile.auth_user_id } }, error: null }; },
    },
    from(table) {
      assert.equal(table, 'users'); let filter;
      const q = {
        select() { return q; },
        eq(key, value) { filter = [key, value]; lookups.push(filter); return q; },
        async single() {
          assert.deepEqual(filter, ['auth_user_id', profile.auth_user_id]);
          // Cùng email, DEMO đứng trước: route vẫn chọn bằng binding được xác minh.
          return { data: [demo, profile].find(row => row[filter[0]] === filter[1]), error: null };
        },
      }; return q;
    },
  };
}
function load(file) {
  file = path.resolve(file); if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const localRequire = name => {
    if (name === '@supabase/supabase-js') return { createClient: provider };
    if (name.startsWith('@/')) return load(path.join('src', name.slice(2) + '.ts'));
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
    return require(name);
  };
  vm.runInThisContext(`(function(require,module,exports){${source}\n})`, { filename: file })(localRequire, module, module.exports);
  return module.exports;
}
function request(action, patch = {}, origin = 'http://localhost:3000') {
  return new Request(`http://localhost:3000/api/auth/${action}`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: profile.email, password: 'offline-test-007', full_name: 'Auth test', ...patch }) });
}
let passed = 0;
async function check(name, run) { await run(); passed++; console.log(`PASS LOCAL: ${name}`); }
try {
  globalThis.fetch = () => { throw new Error('FAIL: network bị cấm trong suite offline'); };
  Object.assign(process.env, { SELLTIME_AUTH_ENABLED: 'true', SELLTIME_AUTH_SUPABASE_URL: 'https://approved-test.invalid', SELLTIME_AUTH_SUPABASE_ANON_KEY: 'offline-placeholder', SELLTIME_AUTH_ORIGIN: 'http://localhost:3000', NODE_ENV: 'test' });
  const route = load('src/app/api/auth/[action]/route.ts');
  const post = (action, patch, origin) => route.POST(request(action, patch, origin), { params: Promise.resolve({ action }) });
  await check('CAP-1 route identity dùng auth_user_id khi DEMO trùng email', async () => {
    const response = await post('signup', { auth_user_id: demo.id, user_id: demo.id, is_kyc_verified: true });
    assert.equal(response.status, 200); const body = await response.json();
    assert.equal(body.identity.userId, profile.id); assert.equal(body.identity.authUserId, profile.auth_user_id); assert.equal(body.identity.role, 'CANDIDATE');
    assert.deepEqual(demo, snapshot); assert.deepEqual(calls.at(-1).args.options.data, { full_name: 'Auth test' });
    assert.ok(!JSON.stringify(body).includes('auth007-token')); assert.ok(!Object.values(body.identity).includes(demo.id));
    assert.match(response.headers.get('set-cookie'), /HttpOnly/); assert.equal(response.headers.get('cache-control'), 'private, no-store');
  });
  await check('CAP-1/CAP-2 API role guard 403 trước provider', async () => {
    for (const role of ['EMPLOYER', 'ADMIN', null, '', 'candidate', 0, {}]) {
      const before = calls.length; assert.equal((await post('signup', { role })).status, 403); assert.equal(calls.length, before);
    }
    assert.equal((await post('signup', { role: 'CANDIDATE' })).status, 200);
  });
  await check('CAP-2 invalid/null/blank/internal whitespace/raw >120 không tới provider', async () => {
    for (const email of [null, undefined, '', ' ', 5, [], {}, 'x @test.invalid', 'x@te\nst.invalid', 'x@test.invalid\tinternal', `x\u00a0@test.invalid`, 'x'.repeat(108) + '@test.invalid']) {
      const before = calls.length; assert.equal((await post('signup', { email })).status, 400, String(email)); assert.equal(calls.length, before);
    }
    for (const password of [null, '', 'short', 'x'.repeat(129)]) {
      const before = calls.length; assert.equal((await post('signup', { password })).status, 400); assert.equal(calls.length, before);
    }
  });
  await check('CAP-2 trim/mixed case/login: giữ policy hiện có, boundary 120', async () => {
    for (const action of ['signup', 'login']) {
      assert.equal((await post(action, { email: ' \u00a0Auth007-Demo@Test.Invalid\u3000 ' })).status, 200);
      assert.equal(calls.at(-1).args.email, 'Auth007-Demo@Test.Invalid');
      const max = 'x'.repeat(107) + '@test.invalid'; assert.equal(max.length, 120);
      assert.equal((await post(action, { email: max })).status, 200); assert.equal(calls.at(-1).args.email, max);
      const before = calls.length; assert.equal((await post(action, { email: ` ${max} ` })).status, 400); assert.equal(calls.length, before);
    }
  });
  await check('CAP-2 Unicode input được giữ byte; KHÔNG chứng minh parity provider/PostgreSQL', async () => {
    for (const email of ['I@test.invalid', '\u0130@test.invalid', '\u0131@test.invalid', '\u00e9@test.invalid', 'e\u0301@test.invalid']) {
      assert.equal((await post('signup', { email })).status, 200); assert.equal(calls.at(-1).args.email, email);
    }
  });
  await check('CAP-2 U+0085 giữ boundary API hiện có; SQL/provider parity NOT RUN', async () => {
    for (const action of ['signup', 'login']) {
      const email = 'a\u0085@test.invalid';
      assert.equal((await post(action, { email })).status, 200);
      assert.equal(calls.at(-1).args.email, email);
    }
  });
  await check('CAP-2 duplicate provider error generic, không enumeration', async () => {
    const bodies = [];
    for (const value of ['duplicate', 'other-error']) {
      mode = value; const response = await post('signup'); assert.equal(response.status, 400); bodies.push(await response.json());
      assert.equal(response.headers.get('set-cookie'), null);
    }
    assert.deepEqual(bodies[0], bodies[1]); assert.ok(!JSON.stringify(bodies).includes('private'));
  });
  await check('CAP-2 confirmation/concealed duplicate không tiết lộ account tồn tại', async () => {
    const bodies = [];
    for (const value of ['confirmation', 'concealed-duplicate']) {
      mode = value; const response = await post('signup'); assert.equal(response.status, 200); bodies.push(await response.json()); assert.equal(response.headers.get('set-cookie'), null);
    }
    assert.deepEqual(bodies[0], { success: true, confirmationRequired: true }); assert.deepEqual(bodies[0], bodies[1]);
  });
  await check('CAP-2 origin/config fail-closed không gọi provider', async () => {
    const before = calls.length; assert.equal((await post('signup', {}, 'https://evil.invalid')).status, 403);
    process.env.SELLTIME_AUTH_ENABLED = 'false'; assert.equal((await post('signup')).status, 503); assert.equal(calls.length, before);
  });
  assert.ok(lookups.length > 0); console.log(`LOCAL ${passed}/${passed}; SQL/provider/concurrency/Unicode integration: NOT RUN; network: 0.`);
} finally { process.env = originalEnv; globalThis.fetch = originalFetch; }
