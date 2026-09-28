import fs from 'node:fs';
import path from 'node:path';
import { SOURCE_EXTENSIONS } from './pathUtils.js';

function candidates(base) {
  const list = [base];
  for (const ext of SOURCE_EXTENSIONS) list.push(`${base}${ext}`);
  for (const ext of SOURCE_EXTENSIONS) list.push(path.join(base, `index${ext}`));
  return list;
}

export function resolveImport(importer, source, projectRoot, aliases = {}) {
  if (!source) return null;
  let base;
  if (source.startsWith('.')) {
    base = path.resolve(path.dirname(importer), source);
  } else {
    const aliasKey = Object.keys(aliases)
      .sort((a, b) => b.length - a.length)
      .find((key) => source === key || source.startsWith(`${key}/`));
    if (!aliasKey) return null;
    base = path.resolve(projectRoot, aliases[aliasKey], source.slice(aliasKey.length).replace(/^\//, ''));
  }
  return candidates(base).find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
}

export async function readAliases(projectRoot) {
  const aliases = { '@': 'src' };
  for (const fileName of ['jsconfig.json', 'tsconfig.json']) {
    try {
      const raw = await fs.promises.readFile(path.join(projectRoot, fileName), 'utf8');
      const clean = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      const config = JSON.parse(clean);
      const baseUrl = config.compilerOptions?.baseUrl || '.';
      for (const [key, values] of Object.entries(config.compilerOptions?.paths || {})) {
        const alias = key.replace(/\/\*$/, '');
        const target = String(values[0] || '').replace(/\/\*$/, '');
        aliases[alias] = path.join(baseUrl, target);
      }
    } catch {
      // 설정이 없거나 JSON이 아니면 기본 alias만 사용한다.
    }
  }
  return aliases;
}
