import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { parseSourceFile } from './parser.js';
import { readAliases, resolveImport } from './resolver.js';
import { detectScreens, locateScope } from './detectors.js';
import { IGNORE_DIRS, isSourceFile, normalizePath } from './pathUtils.js';

async function collectFiles(directory, output = []) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.storybook') continue;
    if (entry.isDirectory() && IGNORE_DIRS.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await collectFiles(absolute, output);
    else if (entry.isFile() && isSourceFile(entry.name)) output.push(absolute);
  }
  return output;
}

async function fileSignature(filePath) {
  const stat = await fs.stat(filePath);
  return `${stat.size}:${stat.mtimeMs}`;
}

async function loadCache(cacheFile) {
  try { return JSON.parse(await fs.readFile(cacheFile, 'utf8')); }
  catch { return { version: 1, files: {} }; }
}

function importLookup(file) {
  const map = new Map();
  for (const item of file.imports) {
    for (const specifier of item.specifiers) map.set(specifier.local, {
      source: item.source,
      imported: specifier.imported,
      kind: specifier.kind,
      local: specifier.local,
    });
  }
  return map;
}

function buildResult(projectRoot, files, errors, aliases, stats) {
  const screens = detectScreens(files);
  const definitionByFileAndName = new Map();
  const definitions = [];
  const fileByPath = new Map(files.map((file) => [file.filePath, file]));

  for (const file of files) {
    for (const component of file.components) {
      const id = `${normalizePath(file.relativePath)}#${component.name}`;
      const definition = {
        id,
        name: component.name,
        filePath: file.filePath,
        relativePath: file.relativePath,
        line: component.line,
        kind: component.kind,
        declaredProps: component.declaredProps,
        exportNames: component.exportNames,
        isDefaultExport: component.isDefaultExport,
        usages: [],
        children: [],
        parents: [],
      };
      definitions.push(definition);
      definitionByFileAndName.set(`${file.filePath}#${component.name}`, definition);
      for (const exportName of component.exportNames) {
        definitionByFileAndName.set(`${file.filePath}#${exportName}`, definition);
      }
    }
  }

  const unresolved = new Map();
  for (const file of files) {
    const imports = importLookup(file);
    const scope = locateScope(file.relativePath, screens);
    for (const usage of file.usages) {
      const imported = imports.get(usage.componentName.split('.')[0]);
      let definition = null;
      let importSource = null;
      if (imported) {
        importSource = imported.source;
        const resolvedFile = resolveImport(file.filePath, imported.source, projectRoot, aliases);
        if (resolvedFile) {
          const importedName = imported.imported === 'default' ? 'default' : imported.imported;
          definition = definitionByFileAndName.get(`${resolvedFile}#${importedName}`) ||
            definitionByFileAndName.get(`${resolvedFile}#${usage.componentName}`);
        }
      } else {
        definition = definitionByFileAndName.get(`${file.filePath}#${usage.componentName}`);
      }

      const usageRecord = {
        filePath: file.filePath,
        relativePath: file.relativePath,
        line: usage.line,
        column: usage.column,
        ownerComponent: usage.ownerComponent,
        parentJsx: usage.parentJsx,
        jsxAncestors: usage.jsxAncestors || [],
        contextImports: (usage.jsxAncestors || []).map((name) => ({ name, ...imports.get(name) })).filter((item) => item.source),
        props: usage.props,
        screenId: scope.screenId,
        tabName: scope.tabName,
        importSource,
        importInfo: imported || null,
        start: usage.start,
        end: usage.end,
      };
      if (definition) {
        definition.usages.push(usageRecord);
        if (usage.ownerComponent) {
          const owner = definitionByFileAndName.get(`${file.filePath}#${usage.ownerComponent}`);
          if (owner && owner.id !== definition.id) {
            if (!owner.children.includes(definition.id)) owner.children.push(definition.id);
            if (!definition.parents.includes(owner.id)) definition.parents.push(owner.id);
          }
        }
      } else {
        const key = usage.componentName;
        const item = unresolved.get(key) || { name: key, usageCount: 0, locations: [] };
        item.usageCount += 1;
        item.locations.push(usageRecord);
        unresolved.set(key, item);
      }
    }
  }

  for (const definition of definitions) {
    definition.usageCount = definition.usages.length;
    definition.screenUsage = [...new Set(definition.usages.map((item) => item.screenId).filter(Boolean))];
    definition.tabUsage = [...new Set(definition.usages.filter((item) => item.tabName).map((item) => `${item.screenId}/${item.tabName}`))];
    const propFrequency = new Map();
    for (const usage of definition.usages) {
      for (const prop of usage.props) propFrequency.set(prop.name, (propFrequency.get(prop.name) || 0) + 1);
    }
    definition.majorProps = [...propFrequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }

  return {
    projectRoot,
    scannedAt: new Date().toISOString(),
    stats: {
      totalFiles: stats.totalFiles,
      parsedFiles: files.length,
      cachedFiles: stats.cachedFiles,
      warningFiles: files.filter((file) => file.warnings.length).length,
      failedFiles: errors.length,
      componentCount: definitions.length,
    },
    aliases,
    screens,
    components: definitions.sort((a, b) => b.usageCount - a.usageCount || a.name.localeCompare(b.name)),
    unresolvedComponents: [...unresolved.values()].sort((a, b) => b.usageCount - a.usageCount),
    errors,
  };
}

export async function scanProject(projectRootInput, options = {}) {
  const projectRoot = path.resolve(projectRootInput);
  const srcRoot = path.join(projectRoot, 'src');
  const packagePath = path.join(projectRoot, 'package.json');
  await fs.access(srcRoot);
  await fs.access(packagePath);
  const sourceFiles = await collectFiles(srcRoot);
  const aliases = await readAliases(projectRoot);
  const cacheDir = options.cacheDir || path.join(projectRoot, '.uib-cache');
  const cacheFile = path.join(cacheDir, 'scan.json');
  const cache = options.fullRescan ? { version: 1, files: {} } : await loadCache(cacheFile);
  const nextCache = { version: 1, projectHash: crypto.createHash('sha1').update(projectRoot).digest('hex'), files: {} };
  const parsedFiles = [];
  const errors = [];
  let cachedFiles = 0;

  for (const filePath of sourceFiles) {
    const signature = await fileSignature(filePath);
    const previous = cache.files[filePath];
    if (previous?.signature === signature && previous.analysis) {
      parsedFiles.push(previous.analysis);
      nextCache.files[filePath] = previous;
      cachedFiles += 1;
      continue;
    }
    try {
      const analysis = await parseSourceFile(filePath, projectRoot);
      parsedFiles.push(analysis);
      nextCache.files[filePath] = { signature, analysis };
    } catch (error) {
      errors.push({
        filePath,
        relativePath: normalizePath(path.relative(projectRoot, filePath)),
        message: error.message,
        line: error.loc?.line || 0,
        column: error.loc?.column || 0,
      });
    }
  }

  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(cacheFile, JSON.stringify(nextCache), 'utf8');
  return buildResult(projectRoot, parsedFiles, errors, aliases, {
    totalFiles: sourceFiles.length,
    cachedFiles,
  });
}
