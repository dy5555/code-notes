import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import { scanProject } from '../src/core/projectScanner.js';

test('fixture scan resolves aliases, usages, screen and tab scopes', async () => {
  const fixture = path.resolve('fixtures/company-like');
  const cacheDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uib-test-'));
  const result = await scanProject(fixture, { cacheDir, fullRescan: true });
  const select = result.components.find((item) => item.name === 'CommonSelect');
  assert.equal(result.stats.failedFiles, 0);
  assert.equal(result.screens[0].id, 'RPA047');
  assert.deepEqual(result.screens[0].tabs.map((item) => item.name), ['Plan', 'Result']);
  assert.equal(select.usageCount, 2);
  assert.deepEqual(select.tabUsage, ['RPA047/Plan', 'RPA047/Result']);
  assert.deepEqual(select.usages.find((item) => item.tabName === 'Plan').jsxAncestors, ['SearchItem', 'SearchRow', 'FormSearchFilter']);
  await fs.rm(cacheDir, { recursive: true, force: true });
});
