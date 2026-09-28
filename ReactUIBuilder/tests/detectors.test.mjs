import test from 'node:test';
import assert from 'node:assert/strict';
import { detectScreens } from '../src/core/detectors.js';

test('RPA047 entry and tabs are grouped as one screen', () => {
  const files = [
    { filePath: 'C:/p/src/pages/RP/PA/RPA047.jsx', relativePath: 'src/pages/RP/PA/RPA047.jsx' },
    { filePath: 'C:/p/src/pages/RP/PA/RPA047/tabs/Plan.jsx', relativePath: 'src/pages/RP/PA/RPA047/tabs/Plan.jsx' },
    { filePath: 'C:/p/src/pages/RP/PA/RPA047/tabs/Result.jsx', relativePath: 'src/pages/RP/PA/RPA047/tabs/Result.jsx' },
  ];
  const screens = detectScreens(files);
  assert.equal(screens.length, 1);
  assert.equal(screens[0].id, 'RPA047');
  assert.deepEqual(screens[0].tabs.map((item) => item.name), ['Plan', 'Result']);
});
