import { app, BrowserWindow, dialog, ipcMain, session, protocol, net } from 'electron';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { scanProject } from '../src/core/projectScanner.js';
import { buildPreviewBundle } from '../src/core/previewEngine.js';
import { isInside } from '../src/core/pathUtils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;
const previewRoots = new Map();
let thumbnailQueue = Promise.resolve();

protocol.registerSchemesAsPrivileged([{
  scheme: 'uib-preview',
  privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true },
}]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1540,
    height: 940,
    minWidth: 1180,
    minHeight: 720,
    show: false,
    backgroundColor: '#0b1020',
    title: 'React UI Builder',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    if (isDev && url.startsWith('http://127.0.0.1:5173')) return;
    if (!isDev && url.startsWith('file://')) return;
    event.preventDefault();
  });

  if (isDev) win.loadURL('http://127.0.0.1:5173');
  else win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

function installNetworkDenyPolicy() {
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const url = details.url;
    const allowed = url.startsWith('file:') || url.startsWith('data:') || url.startsWith('uib-preview:') ||
      (isDev && (url.startsWith('http://127.0.0.1:5173') || url.startsWith('ws://127.0.0.1:5173')));
    callback({ cancel: !allowed });
  });
}

ipcMain.handle('project:select', async () => {
  const result = await dialog.showOpenDialog({
    title: 'React 프로젝트 루트 선택',
    properties: ['openDirectory'],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('project:scan', async (_event, { projectPath, fullRescan }) => {
  const cacheKey = crypto.createHash('sha256').update(projectPath).digest('hex').slice(0, 20);
  const cacheDir = path.join(app.getPath('userData'), 'scan-cache', cacheKey);
  return scanProject(projectPath, { cacheDir, fullRescan });
});

ipcMain.handle('project:snippet', async (_event, { filePath, line }) => {
  const source = await fs.readFile(filePath, 'utf8');
  const lines = source.split(/\r?\n/);
  const start = Math.max(0, Number(line || 1) - 4);
  const end = Math.min(lines.length, Number(line || 1) + 5);
  return lines.slice(start, end).map((text, index) => ({ line: start + index + 1, text }));
});

ipcMain.handle('project:export-report', async (_event, { projectPath, data }) => {
  const outputDir = path.join(projectPath, 'UIBuilder', 'output');
  await fs.mkdir(outputDir, { recursive: true });
  const target = path.join(outputDir, 'component-analysis.json');
  await fs.writeFile(target, JSON.stringify(data, null, 2), 'utf8');
  return target;
});

ipcMain.handle('preview:build', async (_event, options) => {
  const projectRoot = path.resolve(options.projectPath);
  const componentFile = path.resolve(options.component?.filePath || projectRoot);
  if (componentFile !== projectRoot && !isInside(projectRoot, componentFile)) throw new Error('프로젝트 외부 파일은 Preview할 수 없습니다.');
  const previewId = crypto.randomBytes(10).toString('hex');
  const outputDir = path.join(app.getPath('userData'), 'preview-cache', previewId);
  try {
    const result = await buildPreviewBundle({ ...options, projectPath: projectRoot, outputDir });
    previewRoots.set(previewId, outputDir);
    return { ok: true, url: `uib-preview://${previewId}/index.html`, warnings: result.warnings };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
      details: (error.errors || []).map((item) => ({ text: item.text, location: item.location })),
    };
  }
});

async function createThumbnail(options) {
  const projectRoot = path.resolve(options.projectPath);
  const componentFile = path.resolve(options.component?.filePath || projectRoot);
  if (componentFile !== projectRoot && !isInside(projectRoot, componentFile)) throw new Error('프로젝트 외부 파일은 썸네일로 만들 수 없습니다.');
  const stat = await fs.stat(componentFile);
  const cacheKey = crypto.createHash('sha1').update(JSON.stringify({
    projectRoot,
    file: componentFile,
    modified: stat.mtimeMs,
    line: options.usage?.line || 0,
    props: options.mockProps || {},
  })).digest('hex');
  const outputDir = path.join(app.getPath('userData'), 'thumbnail-cache', cacheKey);
  const thumbnailPath = path.join(outputDir, 'thumbnail.png');
  previewRoots.set(cacheKey, outputDir);
  try {
    await fs.access(thumbnailPath);
    return { ok: true, url: `uib-preview://${cacheKey}/thumbnail.png` };
  } catch { /* 캐시가 없으면 생성한다. */ }

  await buildPreviewBundle({
    ...options,
    projectPath: projectRoot,
    outputDir,
    mode: 'isolated',
  });
  const thumbnailWindow = new BrowserWindow({
    width: 520,
    height: 260,
    show: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      offscreen: true,
      backgroundThrottling: false,
    },
  });
  try {
    await thumbnailWindow.loadURL(`uib-preview://${cacheKey}/index.html`);
    await new Promise((resolve) => setTimeout(resolve, 550));
    const image = await thumbnailWindow.webContents.capturePage();
    await fs.writeFile(thumbnailPath, image.resize({ width: 420 }).toPNG());
    return { ok: true, url: `uib-preview://${cacheKey}/thumbnail.png` };
  } finally {
    if (!thumbnailWindow.isDestroyed()) thumbnailWindow.destroy();
  }
}

ipcMain.handle('thumbnail:build', (_event, options) => {
  const job = thumbnailQueue.then(() => createThumbnail(options));
  thumbnailQueue = job.catch(() => undefined);
  return job.catch((error) => ({ ok: false, error: error.message }));
});

ipcMain.handle('builder:write', async (_event, { projectPath, screenName, source }) => {
  const safeName = String(screenName || '').replace(/[^A-Za-z0-9_-]/g, '');
  if (!safeName) throw new Error('올바른 화면명을 입력하세요.');
  const outputDir = path.join(path.resolve(projectPath), 'UIBuilder', 'output');
  await fs.mkdir(outputDir, { recursive: true });
  const target = path.join(outputDir, `${safeName}.jsx`);
  await fs.writeFile(target, source, 'utf8');
  return target;
});

ipcMain.handle('app:version', () => app.getVersion());

app.whenReady().then(() => {
  installNetworkDenyPolicy();
  protocol.handle('uib-preview', (request) => {
    const url = new URL(request.url);
    const root = previewRoots.get(url.hostname);
    if (!root) return new Response('Preview not found', { status: 404 });
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const target = path.resolve(root, relative || 'index.html');
    if (target !== root && !isInside(root, target)) return new Response('Blocked', { status: 403 });
    return net.fetch(pathToFileURL(target).toString());
  });
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
