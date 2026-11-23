import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const docs = readFileSync("docs/GOOGLE-SHEETS-FORM.md", "utf8");
const script = docs.match(/```js\n([\s\S]*?)\n```/)[1];
const rows = [];
const contentService = {
  MimeType: { JSON: "application/json" },
  createTextOutput: body => ({ body, type: "text/plain", setMimeType(type) { this.type = type; return this; } }),
};
const webhook = runInNewContext(script + "\ndoPost", {
  ContentService: contentService,
  SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => ({ appendRow: row => rows.push(row) }) }) },
});

const route = ts.transpileModule(readFileSync("src/app/api/contact/route.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exports = {};
const env = { GOOGLE_SHEETS_WEBHOOK_URL: "https://example.invalid/test", GOOGLE_SHEETS_WEBHOOK_SECRET: "replace-with-a-long-random-secret" };
let providerResponse;
runInNewContext(route, {
  exports, process: { env }, Response, AbortSignal, console: { error() {} },
  fetch: async (_, request) => {
    assert.ok(request.signal instanceof AbortSignal);
    if (providerResponse) return providerResponse();
    const output = webhook({ postData: { contents: request.body } });
    return new Response(output.body, { headers: { "Content-Type": output.type } });
  },
});

const payload = { name: "Contract test", email: "example@example.invalid", brief: "Test fixture" };
const submit = body => exports.POST(new Request("https://example.invalid/api/contact", {
  method: "POST", body: JSON.stringify(body),
}));
assert.equal((await submit(null)).status, 400);
assert.equal((await submit({})).status, 422);
assert.equal((await submit(payload)).status, 200);
assert.equal(rows.length, 1);
env.GOOGLE_SHEETS_WEBHOOK_SECRET = "incorrect";
assert.equal((await submit(payload)).status, 502, "HTTP 200 Unauthorized must not report success");
assert.equal(rows.length, 1);
providerResponse = () => Response.json({ ok: false });
assert.equal((await submit(payload)).status, 502);
providerResponse = () => { throw new DOMException("Timed out", "TimeoutError"); };
assert.equal((await submit(payload)).status, 502);
console.log("PASS: documented Apps Script contract, invalid payload, acknowledgement, rejection and timeout handling");
