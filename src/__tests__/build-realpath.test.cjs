const { test } = require("node:test");
const assert = require("node:assert/strict");
const { withWindowsRealpathFallback } = require("../../scripts/windows-realpath.cjs");

test("Windows EPERM resolves through the synchronous filesystem check", async () => {
  const options = { encoding: "buffer" };
  const expected = Buffer.from("resolved-file");
  const resolver = withWindowsRealpathFallback(
    async () => { throw Object.assign(new Error("denied"), { code: "EPERM" }); },
    (file, actualOptions) => {
      assert.equal(file, "existing-file");
      assert.equal(actualOptions, options);
      return expected;
    },
    "win32",
  );
  assert.equal(await resolver("existing-file", options), expected);
});

test("missing files and non-Windows permission errors remain failures", async () => {
  for (const [platform, code] of [["win32", "ENOENT"], ["linux", "EPERM"]]) {
    const error = Object.assign(new Error(code), { code });
    const resolver = withWindowsRealpathFallback(
      async () => { throw error; },
      () => { assert.fail("must not bypass the failure"); },
      platform,
    );
    await assert.rejects(resolver("file"), (actual) => actual === error);
  }
});

test("a failed synchronous lookup is propagated rather than ignored", async () => {
  const error = Object.assign(new Error("missing"), { code: "ENOENT" });
  const resolver = withWindowsRealpathFallback(
    async () => { throw Object.assign(new Error("denied"), { code: "EPERM" }); },
    () => { throw error; },
    "win32",
  );
  await assert.rejects(resolver("file"), (actual) => actual === error);
});
