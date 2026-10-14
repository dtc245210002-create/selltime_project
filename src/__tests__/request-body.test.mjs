// Kiểm thử policy thật đã transpile; không provider, database hoặc network.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = fs.readFileSync('src/infrastructure/auth/policy.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const policyModule = { exports: {} };
vm.runInThisContext(`(function(module,exports){${compiled}\n})`)(policyModule, policyModule.exports);
const { readBody, AuthError } = policyModule.exports;
const encode = text => new TextEncoder().encode(text);
function streamRequest(chunks, headers = {}, cancel = () => {}) {
  let index = 0;
  return new Request('http://localhost/test', { method: 'POST', headers, duplex: 'half',
    body: new ReadableStream({ pull(controller) {
      if (index === chunks.length) controller.close(); else controller.enqueue(chunks[index++]);
    }, cancel }, { highWaterMark: 0 }) });
}
const rejectsStatus = (req, status) => assert.rejects(readBody(req), error => error instanceof AuthError && error.status === status);
let passed = 0;
async function check(name, run) { await run(); passed++; console.log(`PASS: ${name}`); }
await check('JSON object bình thường và multibyte chia chunk', async () => {
  const bytes = encode('{"text":"Tiếng Việt 😀"}');
  const req = streamRequest(Array.from(bytes, byte => Uint8Array.of(byte)));
  assert.deepEqual(await readBody(req), { text: 'Tiếng Việt 😀' });
  assert.equal(req.body.locked, false);
});
await check('Chấp nhận đúng 32768 byte; UTF-8 tính theo byte', async () => {
  const text = JSON.stringify({ x: 'é'.repeat(16380) });
  assert.equal(encode(text).length, 32768);
  assert.equal((await readBody(streamRequest([encode(text)]))).x.length, 16380);
});
await check('Vượt giới hạn không có Content-Length: 413 và hủy stream', async () => {
  let cancelled = false;
  await rejectsStatus(streamRequest([encode('{"x":"'), encode('x'.repeat(32768)), encode('"}')], {}, () => { cancelled = true; }), 413);
  assert.equal(cancelled, true);
});
await check('Khai Content-Length nhỏ không bỏ qua giới hạn byte thực', async () => {
  await rejectsStatus(streamRequest([encode(JSON.stringify({ x: 'é'.repeat(16381) }))], { 'Content-Length': '1' }), 413);
});
await check('Content-Length lớn: từ chối trước khi đọc body, hủy nguồn', async () => {
  let reads = 0, cancelled = false;
  const req = new Request('http://localhost/test', { method: 'POST', duplex: 'half', headers: { 'Content-Length': '32769' },
    body: new ReadableStream({ pull() { reads++; }, cancel() { cancelled = true; } }, { highWaterMark: 0 }) });
  await rejectsStatus(req, 413);
  assert.equal(reads, 0); assert.equal(cancelled, true);
});
await check('Không đọc chunk sau phần vượt giới hạn; cancellation không chặn lỗi', async () => {
  let reads = 0;
  const req = new Request('http://localhost/test', { method: 'POST', duplex: 'half', body: new ReadableStream({
    pull(controller) { reads++; controller.enqueue(new Uint8Array(32769)); },
    cancel() { return new Promise(() => {}); }
  }, { highWaterMark: 0 }) });
  await rejectsStatus(req, 413); assert.equal(reads, 1); assert.equal(req.body.locked, false);
});
await check('Body rỗng, JSON sai, null/array/scalar đều trả 400', async () => {
  for (const text of ['', '{', 'null', '[]', '1', '"x"']) await rejectsStatus(streamRequest([encode(text)]), 400);
  await rejectsStatus(new Request('http://localhost/test', { method: 'POST' }), 400);
});
await check('Chunk rỗng không thay đổi nội dung JSON', async () => {
  assert.deepEqual(await readBody(streamRequest([new Uint8Array(0), encode('{"ok":true}'), new Uint8Array(0)])), { ok: true });
});
console.log(`Request body: ${passed}/${passed} đạt; network/database: 0 request.`);
