import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = path.resolve('src');
const cache = new Map();

function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const localRequire = (name) => {
    if (name === '@supabase/supabase-js') {
      return {
        createClient: () => ({
          auth: { getUser: async () => ({ data: { user: null }, error: {} }) },
          from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: {} }) }) }) }),
        }),
      };
    }
    if (name.startsWith('@/')) return load(path.join(root, name.slice(2) + '.ts'));
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
    return require(name);
  };
  vm.runInThisContext(`(function(require,module,exports){${source}\n})`, { filename: file })(
    localRequire,
    module,
    module.exports
  );
  return module.exports;
}

const adminRoute = load(path.join(root, 'app/api/admin/route.ts'));

function createMockRequest(url, method = 'GET', body = null) {
  const init = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://localhost:3000',
    },
  };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return new Request(url, init);
}

async function runAdminTests() {
  console.log('=================================================');
  console.log('🛡️ SELLTIME PLATFORM - ADMIN PORTAL & RBAC TESTS');
  console.log('=================================================');

  // 1. Test GET /api/admin?resource=overview
  {
    const req = createMockRequest('http://localhost:3000/api/admin?resource=overview');
    const res = await adminRoute.GET(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.stats);
    assert.ok(typeof data.stats.totalUsers === 'number');
    assert.ok(typeof data.stats.totalShifts === 'number');
    console.log('  ✅ PASS: GET /api/admin Overview trả về số liệu thống kê KPIs chuẩn xác');
  }

  // 2. Test GET /api/admin?resource=users
  {
    const req = createMockRequest('http://localhost:3000/api/admin?resource=users');
    const res = await adminRoute.GET(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.users));
    assert.ok(data.users.length >= 3);
    const hasAdmin = data.users.some((u) => u.role === 'ADMIN');
    const hasEmployer = data.users.some((u) => u.role === 'EMPLOYER');
    const hasCandidate = data.users.some((u) => u.role === 'CANDIDATE');
    assert.ok(hasAdmin && hasEmployer && hasCandidate, 'Cần đầy đủ 3 role trong danh sách quản trị');
    console.log('  ✅ PASS: GET /api/admin Users trả về danh sách có đủ 3 vai trò: ADMIN, EMPLOYER, CANDIDATE');
  }

  // 3. Test GET /api/admin?resource=shifts
  {
    const req = createMockRequest('http://localhost:3000/api/admin?resource=shifts');
    const res = await adminRoute.GET(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.shifts));
    console.log('  ✅ PASS: GET /api/admin Shifts trả về danh sách ca làm việc giám sát');
  }

  // 4. Test GET /api/admin?resource=escrow
  {
    const req = createMockRequest('http://localhost:3000/api/admin?resource=escrow');
    const res = await adminRoute.GET(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.transactions));
    console.log('  ✅ PASS: GET /api/admin Escrow trả về sổ quỹ VietQR bảo chứng');
  }

  // 5. Test POST /api/admin update-role (Cấp quyền EMPLOYER cho CANDIDATE)
  {
    const targetUserId = 'user_cand_huy_01';
    const req = createMockRequest('http://localhost:3000/api/admin', 'POST', {
      action: 'update-role',
      user_id: targetUserId,
      role: 'EMPLOYER',
    });
    const res = await adminRoute.POST(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.role, 'EMPLOYER');
    console.log('  ✅ PASS: Phân quyền nâng cấp CANDIDATE lên EMPLOYER thành công');

    // Khôi phục lại về CANDIDATE
    const revertReq = createMockRequest('http://localhost:3000/api/admin', 'POST', {
      action: 'update-role',
      user_id: targetUserId,
      role: 'CANDIDATE',
    });
    const revertRes = await adminRoute.POST(revertReq);
    assert.equal(revertRes.status, 200);
    const revertData = await revertRes.json();
    assert.equal(revertData.user.role, 'CANDIDATE');
    console.log('  ✅ PASS: Thu hồi quyền EMPLOYER về CANDIDATE thành công');
  }

  // 6. Test POST /api/admin verify-kyc (Duyệt eKYC CCCD)
  {
    const targetUserId = 'user_cand_nam_03';
    const req = createMockRequest('http://localhost:3000/api/admin', 'POST', {
      action: 'verify-kyc',
      user_id: targetUserId,
      is_verified: true,
    });
    const res = await adminRoute.POST(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.is_kyc_verified, true);
    console.log('  ✅ PASS: Phê duyệt định danh eKYC Căn cước công dân thành công');
  }

  // 7. Test POST /api/admin moderate-shift (Khóa ca vi phạm)
  {
    const targetShiftId = 'shift_sos_01';
    const req = createMockRequest('http://localhost:3000/api/admin', 'POST', {
      action: 'moderate-shift',
      shift_id: targetShiftId,
      status: 'CANCELLED',
    });
    const res = await adminRoute.POST(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.shift.status, 'CANCELLED');
    console.log('  ✅ PASS: Khóa/hủy ca làm việc vi phạm (Shift Moderation) thành công');

    // Mở lại ca
    const openReq = createMockRequest('http://localhost:3000/api/admin', 'POST', {
      action: 'moderate-shift',
      shift_id: targetShiftId,
      status: 'OPEN',
    });
    const openRes = await adminRoute.POST(openReq);
    assert.equal(openRes.status, 200);
    const openData = await openRes.json();
    assert.equal(openData.shift.status, 'OPEN');
    console.log('  ✅ PASS: Mở lại ca làm việc thành công');
  }

  console.log('=================================================');
  console.log('🏆 7/7 TEST CASES ADMIN & PHÂN QUYỀN ĐẠT 100% PASS!');
  console.log('=================================================');
}

runAdminTests().catch((err) => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
