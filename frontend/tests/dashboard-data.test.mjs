import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const source = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../app/lib/dashboard-data.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const moduleScope = { exports: {} };
vm.runInNewContext(compiled, { module: moduleScope, exports: moduleScope.exports });
const { summarizeInventory } = moduleScope.exports;

test('derives KPI and priority from actual inventory and prediction rows', () => {
  const barang = [
    { sku: 'A', nama_barang: 'Bearing', kategori_barang: 'Komponen', stok_saat_ini: 4, min_bank: 10 },
    { sku: 'B', nama_barang: 'Belt', kategori_barang: 'Komponen', stok_saat_ini: 20, min_bank: 10 },
    { sku: 'C', nama_barang: 'Valve', kategori_barang: 'Sparepart', stok_saat_ini: 2, min_bank: 5 },
  ];
  const logs = [
    { sku: 'A', is_backorder: true, probabilitas_backorder: 42 },
    { sku: 'B', is_backorder: false, probabilitas_backorder: 5 },
  ];
  const result = summarizeInventory(barang, logs);
  assert.deepEqual({ total: result.total, predicted: result.predicted, risk: result.risk, belowMinimum: result.belowMinimum, healthyStock: result.healthyStock }, { total: 3, predicted: 2, risk: 1, belowMinimum: 2, healthyStock: 1 });
  assert.deepEqual(Array.from(result.priority, item => item.sku), ['A', 'C']);
  assert.deepEqual(Array.from(result.categories, item => [item.name, item.count]), [['Komponen', 2], ['Sparepart', 1]]);
});

test('empty API arrays remain empty without generated operational values', () => {
  const result = summarizeInventory([], []);
  assert.equal(result.total, 0);
  assert.equal(result.priority.length, 0);
  assert.equal(result.categories.length, 0);
});
