import path from 'node:path';

export const SOURCE_EXTENSIONS = ['.js', '.jsx'];
export const IGNORE_DIRS = new Set([
  'node_modules', 'dist', 'build', '.git', 'coverage', '.cache', 'UIBuilder',
]);

export function normalizePath(value) {
  return value.split(path.sep).join('/');
}

export function relativePath(root, value) {
  return normalizePath(path.relative(root, value));
}

export function isSourceFile(value) {
  return SOURCE_EXTENSIONS.includes(path.extname(value).toLowerCase());
}

export function componentId(filePath, name) {
  return `${normalizePath(filePath)}#${name}`;
}

export function isInside(parent, child) {
  const rel = path.relative(parent, child);
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}
