import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import { transform } from 'esbuild-wasm';
import { scanProject } from '../src/core/projectScanner.js';
import { inferBoundary } from '../src/core/boundaryEngine.js';
import { generateJsx } from '../src/core/jsxGenerator.js';
import { buildPreviewBundle } from '../src/core/previewEngine.js';

async function fixtureSelection() {
  const projectPath = path.resolve('fixtures/company-like');
  const cacheDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uib-builder-test-'));
  const scan = await scanProject(projectPath, { cacheDir, fullRescan: true });
  const component = scan.components.find((item) => item.name === 'CommonSelect');
  const usage = component.usages.find((item) => item.tabName === 'Plan');
  return { projectPath, cacheDir, scan, component, usage };
}

test('boundary includes search layout parents and generated JSX parses', async () => {
  const data = await fixtureSelection();
  const boundary = inferBoundary(data.component, data.usage, 'RPA047');
  assert.deepEqual(boundary.includedParents, ['SearchItem', 'SearchRow', 'FormSearchFilter']);
  const source = generateJsx({
    screenName: 'RPA050',
    nodes: [{ component: data.component, usage: data.usage, includedParents: boundary.includedParents, customProps: { label: '공장', placeholder: '선택' } }],
  });
  await transform(source, { loader: 'jsx' });
  assert.match(source, /const RPA050/);
  assert.match(source, /<FormSearchFilter>/);
  assert.match(source, /<CommonSelect/);
  await fs.rm(data.cacheDir, { recursive: true, force: true });
});

test('preview engine builds isolated, context and highlighted screen modes', async () => {
  const data = await fixtureSelection();
  const outputRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'uib-preview-test-'));
  for (const mode of ['isolated', 'context', 'screen']) {
    const outputDir = path.join(outputRoot, mode);
    await buildPreviewBundle({
      projectPath: data.projectPath,
      outputDir,
      component: data.component,
      usage: data.usage,
      mode,
      screenEntry: data.scan.screens[0].entryFiles[0],
      mockProps: { label: '공장', placeholder: '선택' },
    });
    const files = await fs.readdir(outputDir);
    assert.ok(files.includes('index.html'));
    assert.ok(files.includes('preview.js'));
  }
  await fs.rm(data.cacheDir, { recursive: true, force: true });
  await fs.rm(outputRoot, { recursive: true, force: true });
});
