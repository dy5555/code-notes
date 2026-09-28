import path from 'node:path';
import { normalizePath } from './pathUtils.js';

function screenIdFromPath(relativeFile) {
  const normalized = normalizePath(relativeFile);
  const parts = normalized.split('/');
  const pagesIndex = parts.lastIndexOf('pages');
  if (pagesIndex < 0) return null;
  const fileName = path.basename(normalized, path.extname(normalized));
  const tabsIndex = parts.findIndex((item, index) => index > pagesIndex && item.toLowerCase() === 'tabs');
  if (tabsIndex > pagesIndex + 1) return parts[tabsIndex - 1];
  if (parts.length >= 2 && parts[parts.length - 2] === fileName) return fileName;
  return fileName;
}

export function detectScreens(files) {
  const screens = new Map();
  for (const file of files) {
    const id = screenIdFromPath(file.relativePath);
    if (!id) continue;
    const normalized = normalizePath(file.relativePath);
    const inTabs = /\/tabs\//i.test(normalized);
    const candidate = screens.get(id) || { id, entryFiles: [], relatedFiles: [], tabs: [] };
    candidate.relatedFiles.push(file.filePath);
    if (!inTabs && path.basename(normalized, path.extname(normalized)) === id) candidate.entryFiles.push(file.filePath);
    if (inTabs) {
      const tabName = path.basename(normalized, path.extname(normalized));
      if (!candidate.tabs.some((tab) => tab.name === tabName)) {
        candidate.tabs.push({ name: tabName, filePath: file.filePath });
      }
    }
    screens.set(id, candidate);
  }
  return [...screens.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export function locateScope(relativeFile, screens) {
  const normalized = normalizePath(relativeFile);
  const screen = screens.find((candidate) =>
    candidate.relatedFiles.some((file) => normalizePath(file).endsWith(normalized)));
  if (!screen) return { screenId: null, tabName: null };
  const tab = screen.tabs.find((candidate) => normalizePath(candidate.filePath).endsWith(normalized));
  return { screenId: screen.id, tabName: tab?.name || null };
}
