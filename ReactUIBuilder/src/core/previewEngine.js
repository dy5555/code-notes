import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { build } from 'esbuild-wasm';
import { normalizePath } from './pathUtils.js';
import { readAliases } from './resolver.js';

function importStatement(name, filePath, isDefault, exportNames = []) {
  const target = JSON.stringify(normalizePath(filePath));
  if (isDefault || exportNames.includes('default')) return `import ${name} from ${target};`;
  const exported = exportNames.find((item) => item !== 'default') || name;
  return `import { ${exported} as ${name} } from ${target};`;
}

function mockValue(name, value, overrides = {}) {
  if (Object.hasOwn(overrides, name)) return JSON.stringify(overrides[name]);
  if (/options|items|rows|data/i.test(name)) return `[{ label: '샘플 1', value: 'SAMPLE1' }, { label: '샘플 2', value: 'SAMPLE2' }]`;
  if (/^on[A-Z]/.test(name) || /handler/i.test(name)) return '() => {}';
  if (/disabled|expanded|loading|open|visible|checked/i.test(name)) return 'false';
  if (/count|size|page/i.test(name)) return '0';
  if (typeof value === 'string' && !value.startsWith('{') && !value.startsWith('[')) return JSON.stringify(value);
  if (/label/i.test(name)) return JSON.stringify('샘플 항목');
  if (/placeholder/i.test(name)) return JSON.stringify('값을 선택하세요');
  return JSON.stringify('');
}

function propsObject(usage, overrides) {
  const props = usage?.props || [];
  return `{\n${props.filter((item) => item.name !== '...spread').map((item) => `  ${JSON.stringify(item.name)}: ${mockValue(item.name, item.value, overrides)}`).join(',\n')}\n}`;
}

function contextImports(usage) {
  const groups = new Map();
  for (const info of usage?.contextImports || []) {
    const group = groups.get(info.source) || { default: null, named: [] };
    if (info.imported === 'default') group.default = info.local || info.name;
    else group.named.push(info.imported === info.local ? info.imported : `${info.imported} as ${info.local}`);
    groups.set(info.source, group);
  }
  return [...groups.entries()].map(([source, group]) => {
    const clause = [group.default, group.named.length ? `{ ${group.named.join(', ')} }` : null].filter(Boolean).join(', ');
    return `import ${clause} from ${JSON.stringify(source)};`;
  }).join('\n');
}

function wrapContext(child, usage) {
  let result = child;
  for (const name of usage?.jsxAncestors || []) {
    if (!/^[A-Z]/.test(name) || /App|Router|Provider|Page|Screen|Layout|Tabs?/i.test(name)) break;
    result = `<${name}>${result}</${name}>`;
  }
  return result;
}

async function existingGlobalCss(projectRoot) {
  for (const candidate of ['src/index.css', 'src/main.css', 'src/App.css']) {
    try { await fs.access(path.join(projectRoot, candidate)); return candidate; } catch { /* continue */ }
  }
  return null;
}

function runtimeShell(renderExpression) {
  return `
class PreviewErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <div className="uib-runtime-error"><strong>렌더링 실패</strong><pre>{this.state.error.stack || this.state.error.message}</pre></div>;
    return this.props.children;
  }
}
window.addEventListener('error', (event) => {
  const root = document.getElementById('root');
  if (root && !root.children.length) root.innerHTML = '<div class="uib-runtime-error"><strong>실행 오류</strong><pre>' + String(event.error?.stack || event.message) + '</pre></div>';
});
createRoot(document.getElementById('root')).render(<PreviewErrorBoundary>${renderExpression}</PreviewErrorBoundary>);
`;
}

function buildEntry({ component, usage, mode, screenEntry, mockProps, globalCss }) {
  const common = `import React from 'react';\nimport { createRoot } from 'react-dom/client';\n${globalCss ? `import ${JSON.stringify(normalizePath(globalCss))};` : ''}`;
  if (mode === 'screen' && screenEntry) {
    return `${common}\nimport Screen from ${JSON.stringify(normalizePath(screenEntry))};\n${runtimeShell('<Screen />')}`;
  }
  const componentImport = importStatement(component.name, component.filePath, component.isDefaultExport, component.exportNames);
  const context = mode === 'context' ? contextImports(usage) : '';
  const selected = `<div className="uib-highlight-wrapper"><${component.name} {...mockProps} /></div>`;
  const jsx = mode === 'context' ? wrapContext(selected, usage) : selected;
  return `${common}\n${componentImport}\n${context}\nconst mockProps = ${propsObject(usage, mockProps)};\n${runtimeShell(jsx)}`;
}

function previewPlugin({ projectRoot, aliases, highlight }) {
  return {
    name: 'ui-builder-preview',
    setup(buildApi) {
      buildApi.onResolve({ filter: /.*/ }, async (args) => {
        const aliasKey = Object.keys(aliases).sort((a, b) => b.length - a.length)
          .find((key) => args.path === key || args.path.startsWith(`${key}/`));
        if (aliasKey) {
          const base = path.resolve(projectRoot, aliases[aliasKey], args.path.slice(aliasKey.length).replace(/^\//, ''));
          const candidates = [base, `${base}.js`, `${base}.jsx`, `${base}.css`, path.join(base, 'index.js'), path.join(base, 'index.jsx')];
          for (const candidate of candidates) {
            try { await fs.access(candidate); return { path: candidate }; } catch { /* next */ }
          }
          return { path: base };
        }
        return null;
      });
      if (highlight?.filePath && Number.isInteger(highlight.start) && Number.isInteger(highlight.end)) {
        buildApi.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
          if (path.resolve(args.path) !== path.resolve(highlight.filePath)) return null;
          const source = await fs.readFile(args.path, 'utf8');
          const selected = source.slice(highlight.start, highlight.end);
          const contents = `${source.slice(0, highlight.start)}<div className="uib-highlight-wrapper">${selected}</div>${source.slice(highlight.end)}`;
          return { contents, loader: path.extname(args.path).includes('x') ? 'jsx' : 'js' };
        });
      }
    },
  };
}

const BASE_CSS = `
html,body,#root{min-height:100%;margin:0}body{font-family:Arial,"Malgun Gothic",sans-serif;background:#fff;color:#202735;padding:24px;box-sizing:border-box}
*{box-sizing:border-box}.uib-highlight-wrapper{outline:3px solid #4f7cff!important;outline-offset:4px;background:rgba(79,124,255,.06);border-radius:4px;min-height:20px}
.uib-runtime-error{padding:16px;border:1px solid #e25b67;background:#fff2f3;color:#8f1e29;border-radius:8px}.uib-runtime-error pre{white-space:pre-wrap;font-size:11px}
`;

export async function buildPreviewBundle(options) {
  const projectRoot = path.resolve(options.projectPath);
  const outputDir = path.resolve(options.outputDir);
  const aliases = await readAliases(projectRoot);
  const globalCssRelative = await existingGlobalCss(projectRoot);
  const globalCss = globalCssRelative ? path.join(projectRoot, globalCssRelative) : null;
  const entry = buildEntry({ ...options, globalCss });
  const result = await build({
    stdin: { contents: entry, loader: 'jsx', resolveDir: projectRoot, sourcefile: 'uib-preview-entry.jsx' },
    bundle: true,
    write: false,
    outdir: 'out',
    entryNames: 'preview',
    assetNames: 'assets/[name]-[hash]',
    platform: 'browser',
    format: 'iife',
    target: ['chrome120'],
    jsx: 'automatic',
    sourcemap: false,
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    loader: { '.png': 'dataurl', '.jpg': 'dataurl', '.jpeg': 'dataurl', '.gif': 'dataurl', '.svg': 'dataurl', '.woff': 'dataurl', '.woff2': 'dataurl' },
    plugins: [previewPlugin({ projectRoot, aliases, highlight: options.mode === 'screen' ? options.usage : null })],
  });
  await fs.mkdir(outputDir, { recursive: true });
  let scriptName = '';
  let cssName = '';
  for (const file of result.outputFiles) {
    const name = path.basename(file.path);
    await fs.writeFile(path.join(outputDir, name), file.contents);
    if (name.endsWith('.js')) scriptName = name;
    if (name.endsWith('.css')) cssName = name;
  }
  const nonce = crypto.randomBytes(12).toString('base64');
  const html = `<!doctype html><html><head><meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="default-src 'self' data:; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'none'">${cssName ? `<link rel="stylesheet" href="./${cssName}">` : ''}<style>${BASE_CSS}</style></head><body><div id="root"></div><script nonce="${nonce}" src="./${scriptName}"></script></body></html>`;
  await fs.writeFile(path.join(outputDir, 'index.html'), html, 'utf8');
  return { warnings: result.warnings.map((item) => item.text) };
}
