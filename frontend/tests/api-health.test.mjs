import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const source = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../app/lib/api.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

function getHealthWith(fetchMock) {
  const moduleScope = { exports: {} };
  vm.runInNewContext(compiled, { module: moduleScope, exports: moduleScope.exports, fetch: fetchMock, process: { env: {} } });
  return moduleScope.exports.getHealth;
}

test('health response remains readable when Express reports HTTP 503', async () => {
  const getHealth = getHealthWith(async () => ({ status: 503, json: async () => ({ backend: 'ok', database: 'error', model_service: 'ok' }) }));
  const status = await getHealth();
  assert.deepEqual({ ...status }, { backend: 'ok', database: 'error', model_service: 'ok' });
});

test('unreachable health endpoint is reported as a failed request', async () => {
  const getHealth = getHealthWith(async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(getHealth(), /Failed to fetch/);
});
