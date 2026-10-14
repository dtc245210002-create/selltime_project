// Kiểm thử API/server bằng Supabase giả lập; tuyệt đối không gọi provider.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = path.resolve('src');
const cache = new Map();
let providerCalls = 0;
let providerFailure;
const revokedTokens = [];
const users = [
  { id: 'a', auth_user_id: 'auth-a', role: 'CANDIDATE', full_name: 'A', email: 'a@test.invalid', avatar_url: '' },
  { id: 'b', auth_user_id: 'auth-b', role: 'EMPLOYER', full_name: 'B', email: 'b@test.invalid', avatar_url: '' },
  { id: 'admin', auth_user_id: 'auth-admin', role: 'ADMIN', full_name: 'Admin', email: 'admin@test.invalid', avatar_url: '' },
];
const tables = { users, shifts: [], conversations: [{ id: 'ab', candidate_id: 'a', employer_id: 'b' }, { id: 'private', candidate_id: 'other', employer_id: 'b' }], messages: [] };
function client(token) {
  const getIdentity = () => users.find(u => `token-${u.id}` === token);
  return {
    auth: {
      getUser: async supplied => { providerCalls++; if (providerFailure === 'getUser') throw new Error('Provider không khả dụng'); const u = users.find(u => `token-${u.id}` === supplied && !revokedTokens.includes(supplied)); return { data: { user: u ? { id: u.auth_user_id } : null }, error: u ? null : {} }; },
      signInWithPassword: async ({ email }) => { token = `token-${users.find(u => u.email === email)?.id}`; return { data: { session: { access_token: token, refresh_token: 'refresh', expires_in: 60 } }, error: null }; },
      signUp: async () => ({ data: { session: null }, error: null }),
      refreshSession: async ({ refresh_token }) => { if (refresh_token !== 'refresh') return { data: { session: null }, error: {} }; token = 'token-a'; return { data: { session: { access_token: token, refresh_token: 'new-refresh', expires_in: 60 } }, error: null }; },
      signOut: async () => ({ error: null }),
      admin: { signOut: async supplied => { assert.ok(supplied.startsWith('token-')); if (providerFailure === 'signOutThrow') throw new Error('Provider không khả dụng'); if (providerFailure === 'signOut') return { error: {} }; revokedTokens.push(supplied); return { error: null }; } },
    },
    rpc: async (name, args) => {
      const caller = getIdentity();
      if (caller?.role !== 'ADMIN') return { error: { code: '42501' } };
      const target = users.find(u => u.id === args.target_user_id);
      if (!target || target.role === 'ADMIN') return { error: { code: '42501' } };
      target.role = args.enabled ? 'EMPLOYER' : 'CANDIDATE'; return { error: null };
    },
    from(table) {
      let filters = [], insert, deleting = false, limit = Infinity, descending = false;
      const q = {
        select() { return q; }, eq(key, value) { filters.push([key, value]); return q; },
        order(key, opts) { descending = opts?.ascending === false; return q; }, limit(n) { limit = n; return q; },
        insert(row) { insert = row; return q; }, delete() { deleting = true; return q; },
        single: async () => execute(true), maybeSingle: async () => execute(true),
        then(resolve, reject) { return Promise.resolve(execute(false)).then(resolve, reject); },
      };
      function execute(single) {
        let rows = tables[table].filter(row => filters.every(([k, v]) => row[k] === v));
        // Giả lập RLS chỉ để kiểm thử hợp đồng API; SQL integration riêng mới xác minh policy thật.
        if (table === 'shifts' && !insert) rows = rows.filter(row => row.employer_id === getIdentity()?.id);
        if (insert) {
          if (tables[table].some(row => row.id === insert.id)) return { data: null, error: { code: '23505' } };
          tables[table].push(insert); rows = [insert];
        }
        if (deleting) tables[table] = tables[table].filter(row => !rows.includes(row));
        if (descending) rows = [...rows].reverse();
        rows = rows.slice(0, limit);
        return { data: single ? rows[0] ?? null : rows, error: null };
      }
      return q;
    },
  };
}
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const localRequire = name => {
    if (name === '@supabase/supabase-js') return { createClient: (url, key, options) => client(options.global.headers.Authorization?.slice(7)) };
    if (name.startsWith('@/')) return load(path.join(root, name.slice(2) + '.ts'));
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
    return require(name);
  };
  vm.runInThisContext(`(function(require,module,exports){${source}\n})`, { filename: file })(localRequire, module, module.exports);
  return module.exports;
}
const server = load(path.join(root, 'infrastructure/auth/server.ts'));
const shifts = load(path.join(root, 'app/api/shifts/route.ts'));
const messages = load(path.join(root, 'app/api/messages/route.ts'));
const auth = load(path.join(root, 'app/api/auth/[action]/route.ts'));
const originalEnv = { ...process.env };
process.env.SELLTIME_AUTH_ENABLED = 'true'; process.env.SELLTIME_AUTH_SUPABASE_URL = 'https://approved-test.invalid'; process.env.SELLTIME_AUTH_SUPABASE_ANON_KEY = 'unit-placeholder'; process.env.SELLTIME_AUTH_ORIGIN = 'http://localhost:3000'; process.env.NODE_ENV = 'test';
function request(url, method = 'GET', token, body, origin = 'http://localhost:3000') {
  return new Request(`http://localhost:3000${url}`, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(method !== 'GET' ? { Origin: origin, 'Content-Type': 'application/json' } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
}
let passed = 0;
async function check(name, run) { await run(); passed++; console.log(`PASS: ${name}`); }
const context = action => ({ params: Promise.resolve({ action }) });
function cookieRequest(url, method, cookies, origin = 'http://localhost:3000') {
  return new Request(`http://localhost:3000${url}`, { method, headers: { Cookie: cookies, ...(method !== 'GET' ? { Origin: origin } : {}) } });
}
function cookieHeader(response) {
  return response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
}
function assertCleared(response) {
  for (const name of [server.ACCESS_COOKIE, server.REFRESH_COOKIE]) {
    const value = response.headers.getSetCookie().find(value => value.startsWith(`${name}=`));
    assert.ok(value, `Thiếu cookie ${name}`);
    assert.ok(value.startsWith(`${name}=;`));
    assert.match(value, /Max-Age=0/i);
    assert.match(value, /Path=\//i);
    assert.match(value, /HttpOnly/i);
    assert.match(value, /SameSite=strict/i);
  }
}
try {
  await check('Cấu hình mặc định tắt/thiếu không gọi provider (503)', async () => {
    const calls = providerCalls; process.env.SELLTIME_AUTH_ENABLED = 'false';
    assert.equal((await shifts.GET(request('/api/shifts'))).status, 503);
    process.env.SELLTIME_AUTH_ENABLED = 'true'; const key = process.env.SELLTIME_AUTH_SUPABASE_ANON_KEY; delete process.env.SELLTIME_AUTH_SUPABASE_ANON_KEY;
    assert.equal((await messages.GET(request('/api/messages?conversation_id=ab'))).status, 503); assert.equal(providerCalls, calls); process.env.SELLTIME_AUTH_SUPABASE_ANON_KEY = key;
  });
  await check('Token thiếu/giả/hết hạn bị từ chối (401)', async () => {
    for (const token of [undefined, 'fake', 'expired']) assert.equal((await shifts.GET(request('/api/shifts', 'GET', token))).status, 401);
  });
  await check('Candidate không đăng ca (403)', async () => assert.equal((await shifts.POST(request('/api/shifts', 'POST', 'token-a', { shift: {} }))).status, 403));
  await check('Origin sai bị từ chối mutation (403)', async () => assert.equal((await messages.POST(request('/api/messages', 'POST', 'token-a', {}, 'https://evil.invalid'))).status, 403));
  const validShift = { id: 'new', employer_id: 'b', title: 'Ca test', description: '', work_type: 'PART_TIME', period: 'EVENING', shift_date: '2026-10-08', shift_start: '18:00', shift_end: '20:00', duration_hours: 2, hourly_wage: 10, total_budget: 20, required_candidates: 1, is_sos: false, location_coords: { latitude: 0, longitude: 0 }, location_address: 'Test' };
  await check('Giả owner 403, INSERT đúng owner, ID trùng 409 không ghi đè', async () => {
    assert.equal((await shifts.POST(request('/api/shifts', 'POST', 'token-b', { shift: { ...validShift, employer_id: 'a' } }))).status, 403);
    assert.equal((await shifts.POST(request('/api/shifts', 'POST', 'token-b', { shift: validShift }))).status, 201);
    assert.equal((await shifts.POST(request('/api/shifts', 'POST', 'token-b', { shift: validShift }))).status, 409);
    assert.equal(tables.shifts.length, 1); assert.equal(tables.shifts[0].employer_id, 'b');
  });
  await check('Hai session nhận dữ liệu ca riêng theo client RLS của request', async () => {
    const a = await (await shifts.GET(request('/api/shifts', 'GET', 'token-a'))).json();
    const b = await (await shifts.GET(request('/api/shifts', 'GET', 'token-b'))).json();
    assert.equal(a.data.length, 0); assert.equal(b.data.length, 1);
  });
  let validationId = 0;
  async function validateShift(patch, status) {
    const count = tables.shifts.length;
    const shift = { ...validShift, id: `validation-${validationId++}`, ...patch };
    try {
      const response = await shifts.POST(request('/api/shifts', 'POST', 'token-b', { shift }));
      assert.equal(response.status, status, JSON.stringify(patch));
      assert.equal(tables.shifts.length, count + (status === 201 ? 1 : 0));
      if (status === 201) {
        const { data } = await response.json();
        for (const field of ['shift_start', 'shift_end', 'hourly_wage', 'total_budget', 'sos_bonus_amount']) {
          assert.equal(data[field], shift[field] ?? (field === 'sos_bonus_amount' ? 0 : undefined), field);
        }
      }
    } finally { tables.shifts.splice(count); }
  }
  await check('Giờ sai range/format bị từ chối 400 trước INSERT ở cả start/end', async () => {
    for (const field of ['shift_start', 'shift_end']) {
      for (const value of ['24:00', '99:99', '23:60', '00:60', '-1:00', '1:00', '01:0', ' 01:00', '01:00 ', '01:00\n', '01:00:00', '']) {
        await validateShift({ [field]: value }, 400);
      }
    }
  });
  await check('Giờ không phải string không bị coercion', async () => {
    for (const field of ['shift_start', 'shift_end']) {
      for (const value of [undefined, null, 1800, true, ['18:00'], {}]) await validateShift({ [field]: value }, 400);
    }
  });
  await check('Giờ biên 00:00/23:59 và các đoạn range hợp lệ giữ nguyên', async () => {
    for (const field of ['shift_start', 'shift_end']) {
      for (const value of ['00:00', '09:59', '10:00', '19:59', '20:00', '23:59']) await validateShift({ [field]: value }, 201);
    }
  });
  await check('Các trường tiền vượt INT max hoặc sai kiểu/phân số bị từ chối trước INSERT', async () => {
    for (const field of ['hourly_wage', 'total_budget', 'sos_bonus_amount']) {
      for (const value of [2147483648, Number.MAX_SAFE_INTEGER, 1.5, -1, '1', null, true, [], {}]) await validateShift({ [field]: value }, 400);
    }
  });
  await check('Wage/budget vẫn dương và bắt buộc; bonus vẫn không âm và optional', async () => {
    for (const field of ['hourly_wage', 'total_budget']) {
      for (const value of [0, undefined]) await validateShift({ [field]: value }, 400);
    }
    await validateShift({ hourly_wage: 1, total_budget: 1, sos_bonus_amount: 0 }, 201);
    await validateShift({ sos_bonus_amount: undefined }, 201);
  });
  await check('INT max được chấp nhận riêng từng field và đồng thời, không đổi budget formula', async () => {
    for (const field of ['hourly_wage', 'total_budget', 'sos_bonus_amount']) await validateShift({ [field]: 2147483647 }, 201);
    await validateShift({ hourly_wage: 2147483647, total_budget: 2147483647, sos_bonus_amount: 2147483647 }, 201);
  });
  await check('Hội thoại người khác không đọc/gửi/xóa (404)', async () => {
    assert.equal((await messages.GET(request('/api/messages?conversation_id=private', 'GET', 'token-a'))).status, 404);
    assert.equal((await messages.POST(request('/api/messages', 'POST', 'token-a', { conversation_id: 'private', content: 'secret' }))).status, 404);
    assert.equal((await messages.DELETE(request('/api/messages?conversation_id=private&message_id=x', 'DELETE', 'token-a'))).status, 404);
  });
  await check('Sender từ session và giới hạn input', async () => {
    assert.equal((await messages.POST(request('/api/messages', 'POST', 'token-a', { conversation_id: 'ab', content: 'hello', sender_id: 'b' }))).status, 403);
    assert.equal((await messages.POST(request('/api/messages', 'POST', 'token-a', { conversation_id: 'ab', content: 'x'.repeat(2001) }))).status, 400);
    const response = await messages.POST(request('/api/messages', 'POST', 'token-a', { conversation_id: 'ab', content: 'hello', sender_name: 'Spoof', id: 'fake' }));
    assert.equal(response.status, 201); const { data } = await response.json(); assert.equal(data.sender_id, 'a'); assert.equal(data.sender_name, 'A'); assert.notEqual(data.id, 'fake');
    assert.equal((await messages.DELETE(request(`/api/messages?conversation_id=ab&message_id=${data.id}`, 'DELETE', 'token-b'))).status, 404);
    assert.equal((await messages.DELETE(request(`/api/messages?conversation_id=ab&message_id=${data.id}`, 'DELETE', 'token-a'))).status, 200);
  });
  await check('Không có reset chat không bảo vệ', async () => assert.equal((await messages.DELETE(request('/api/messages?conversation_id=ab', 'DELETE', 'token-a'))).status, 400));
  await check('Đăng ký role Employer/Admin bị từ chối 403', async () => {
    for (const role of ['EMPLOYER', 'ADMIN']) assert.equal((await auth.POST(request('/api/auth/signup', 'POST', undefined, { email: 'new@test.invalid', password: 'testpass123', full_name: 'Test', role }), context('signup'))).status, 403);
  });
  await check('Hồ sơ liên kết UUID và role mới từ database', async () => {
    const verified = await server.authenticate(request('/api/auth/session', 'GET', 'token-a'));
    assert.equal(verified.identity.authUserId, 'auth-a'); assert.equal(verified.identity.userId, 'a'); assert.equal(verified.identity.role, 'CANDIDATE');
    assert.equal((await auth.POST(request('/api/auth/employer', 'POST', 'token-a', { user_id: 'a', enabled: true }), context('employer'))).status, 403);
    assert.equal((await auth.POST(request('/api/auth/employer', 'POST', 'token-admin', { user_id: 'a', enabled: true }), context('employer'))).status, 200);
    assert.equal((await server.authenticate(request('/', 'GET', 'token-a'))).identity.role, 'EMPLOYER');
    assert.equal((await auth.POST(request('/api/auth/employer', 'POST', 'token-admin', { user_id: 'a', enabled: false }), context('employer'))).status, 200);
    assert.equal((await server.authenticate(request('/', 'GET', 'token-a'))).identity.role, 'CANDIDATE');
    assert.equal((await auth.POST(request('/api/auth/employer', 'POST', 'token-admin', { user_id: 'admin', enabled: false }), context('employer'))).status, 403);
  });
  await check('Login chỉ trả identity, cookie bảo vệ; refresh/logout có origin guard', async () => {
    const response = await auth.POST(request('/api/auth/login', 'POST', undefined, { email: users[0].email, password: 'testpass123' }), context('login'));
    assert.equal(response.status, 200); const text = await response.text(); assert.ok(!text.includes('token-a')); assert.ok(response.headers.get('set-cookie').includes('HttpOnly')); assert.ok(response.headers.get('set-cookie').includes('SameSite=strict'));
    assert.equal((await auth.POST(request('/api/auth/refresh', 'POST', undefined, undefined, 'https://evil.invalid'), context('refresh'))).status, 403);
    assert.equal((await auth.POST(request('/api/auth/logout', 'POST', 'token-a', undefined, 'https://evil.invalid'), context('logout'))).status, 403);
    const logout = await auth.POST(request('/api/auth/logout', 'POST', 'token-a'), context('logout'));
    assert.equal(logout.status, 200); assertCleared(logout); revokedTokens.length = 0;
  });
  await check('Cookie login/session/refresh/logout: thay cookie và mất quyền sau logout', async () => {
    const login = await auth.POST(request('/api/auth/login', 'POST', undefined, { email: users[0].email, password: 'testpass123' }), context('login'));
    const cookies = cookieHeader(login);
    assert.equal((await auth.GET(cookieRequest('/api/auth/session', 'GET', cookies), context('session'))).status, 200);
    const refresh = await auth.POST(cookieRequest('/api/auth/refresh', 'POST', cookies), context('refresh'));
    assert.equal(refresh.status, 200);
    assert.match(cookieHeader(refresh), /selltime-auth-refresh=new-refresh/);
    assert.ok(!(await refresh.text()).includes('new-refresh'));
    const logout = await auth.POST(cookieRequest('/api/auth/logout', 'POST', cookieHeader(refresh)), context('logout'));
    assert.equal(logout.status, 200); assertCleared(logout);
    assert.equal((await auth.GET(cookieRequest('/api/auth/session', 'GET', cookieHeader(logout)), context('session'))).status, 401);
    assert.equal((await auth.GET(cookieRequest('/api/auth/session', 'GET', cookies), context('session'))).status, 401);
    revokedTokens.length = 0;
  });
  await check('Logout dọn cookie khi thiếu/giả/hết hạn/malformed session, kể cả có refresh token', async () => {
    for (const access of ['', 'fake', 'expired', '%ZZ']) {
      const response = await auth.POST(cookieRequest('/api/auth/logout', 'POST', `${server.ACCESS_COOKIE}=${access}; ${server.REFRESH_COOKIE}=refresh`), context('logout'));
      assert.equal(response.status, 200); assertCleared(response);
    }
  });
  await check('Logout dọn cookie khi provider xác minh hoặc thu hồi thất bại', async () => {
    try {
      for (const failure of ['getUser', 'signOut', 'signOutThrow']) {
        providerFailure = failure;
        const response = await auth.POST(cookieRequest('/api/auth/logout', 'POST', `${server.ACCESS_COOKIE}=token-a; ${server.REFRESH_COOKIE}=refresh`), context('logout'));
        assert.equal(response.status, 503); assertCleared(response);
        assert.ok(!(await response.text()).includes('token-a'));
      }
    } finally { providerFailure = undefined; }
  });
  await check('Logout sai Origin không xóa cookie; refresh sai token bị từ chối', async () => {
    const cookies = `${server.ACCESS_COOKIE}=token-a; ${server.REFRESH_COOKIE}=refresh`;
    const rejected = await auth.POST(cookieRequest('/api/auth/logout', 'POST', cookies, 'https://evil.invalid'), context('logout'));
    assert.equal(rejected.status, 403); assert.equal(rejected.headers.getSetCookie().length, 0);
    for (const value of ['invalid', '%ZZ', '']) {
      const refresh = await auth.POST(cookieRequest('/api/auth/refresh', 'POST', `${server.ACCESS_COOKIE}=token-a; ${server.REFRESH_COOKIE}=${value}`), context('refresh'));
      assert.equal(refresh.status, 401); assertCleared(refresh);
    }
  });
  await check('DEMO persona không tạo session thật; route không fallback/ntfy/cache chung', async () => {
    assert.equal((await shifts.GET(request('/api/shifts', 'GET', 'user_emp_lan_02'))).status, 401);
    const page = fs.readFileSync(path.join(root, 'app/auth/page.tsx'), 'utf8'); assert.ok(!/localStorage\s*[.[]/.test(page)); assert.ok(!/from\s+[\"'].*application\/store/.test(page));
    for (const file of ['app/api/shifts/route.ts', 'app/api/messages/route.ts']) assert.ok(!/ntfy\.sh|memoryShifts|globalMessageStore|getShiftsFromSql/.test(fs.readFileSync(path.join(root, file), 'utf8')));
    assert.equal((await auth.GET(request('/api/auth/session', 'GET', 'token-a'), context('session'))).headers.get('cache-control'), 'private, no-store');
  });
  console.log(`Security: ${passed}/${passed} đạt; provider/database thật: 0 request.`);
} finally { process.env = originalEnv; }

