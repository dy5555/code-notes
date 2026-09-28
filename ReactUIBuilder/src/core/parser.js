import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import { normalizePath } from './pathUtils.js';

const traverse = traverseModule.default || traverseModule;

function jsxName(node) {
  if (!node) return '';
  if (node.type === 'JSXIdentifier') return node.name;
  if (node.type === 'JSXMemberExpression') return `${jsxName(node.object)}.${jsxName(node.property)}`;
  return '';
}

function literalValue(node) {
  if (!node) return true;
  if (node.type === 'StringLiteral') return node.value;
  if (node.type !== 'JSXExpressionContainer') return '{unknown}';
  const expression = node.expression;
  if (expression.type === 'StringLiteral' || expression.type === 'NumericLiteral' || expression.type === 'BooleanLiteral') {
    return expression.value;
  }
  if (expression.type === 'Identifier') return `{${expression.name}}`;
  if (expression.type === 'ArrayExpression') return `[${expression.elements.length} items]`;
  if (expression.type === 'ObjectExpression') return `{${expression.properties.length} fields}`;
  return `{${expression.type}}`;
}

function getFunctionName(pathRef) {
  const node = pathRef.node;
  if (node.id?.name) return node.id.name;
  const parent = pathRef.parentPath?.node;
  if (parent?.type === 'VariableDeclarator' && parent.id.type === 'Identifier') return parent.id.name;
  return '';
}

function nearestOwner(pathRef) {
  const owner = pathRef.findParent((candidate) =>
    candidate.isFunctionDeclaration() || candidate.isFunctionExpression() || candidate.isArrowFunctionExpression() || candidate.isClassDeclaration());
  return owner ? getFunctionName(owner) : '';
}

function extractParameterProps(node) {
  const param = node.params?.[0];
  if (!param || param.type !== 'ObjectPattern') return [];
  return param.properties
    .map((property) => property.key?.name || property.key?.value)
    .filter(Boolean);
}

export async function parseSourceFile(absolutePath, projectRoot) {
  const source = await fs.readFile(absolutePath, 'utf8');
  const relativeFile = normalizePath(path.relative(projectRoot, absolutePath));
  const analysis = {
    filePath: absolutePath,
    relativePath: relativeFile,
    imports: [],
    exports: [],
    components: [],
    usages: [],
    warnings: [],
  };

  let ast;
  try {
    ast = parse(source, {
      sourceType: 'unambiguous',
      errorRecovery: true,
      plugins: [
        'jsx', 'classProperties', 'classPrivateProperties', 'classPrivateMethods',
        'objectRestSpread', 'optionalChaining', 'nullishCoalescingOperator',
        'dynamicImport', 'topLevelAwait', 'decorators-legacy',
      ],
    });
    analysis.warnings = (ast.errors || []).map((error) => ({
      message: error.message,
      line: error.loc?.line || 0,
      column: error.loc?.column || 0,
    }));
  } catch (error) {
    error.filePath = absolutePath;
    throw error;
  }

  const componentMap = new Map();
  const exportMap = new Map();

  function registerComponent(name, kind, node, props = []) {
    if (!name || !/^[A-Z]/.test(name)) return;
    const existing = componentMap.get(name);
    const entry = existing || {
      name,
      kind,
      line: node.loc?.start.line || 1,
      column: node.loc?.start.column || 0,
      declaredProps: [],
      exportNames: [],
      isDefaultExport: false,
    };
    entry.declaredProps = [...new Set([...entry.declaredProps, ...props])];
    componentMap.set(name, entry);
  }

  traverse(ast, {
    ImportDeclaration(pathRef) {
      const specifiers = pathRef.node.specifiers.map((specifier) => ({
        local: specifier.local.name,
        imported: specifier.type === 'ImportDefaultSpecifier'
          ? 'default'
          : specifier.type === 'ImportNamespaceSpecifier'
            ? '*'
            : specifier.imported.name || specifier.imported.value,
        kind: specifier.type,
      }));
      analysis.imports.push({
        source: pathRef.node.source.value,
        line: pathRef.node.loc?.start.line || 1,
        specifiers,
      });
    },
    FunctionDeclaration(pathRef) {
      const name = pathRef.node.id?.name;
      registerComponent(name, 'function', pathRef.node, extractParameterProps(pathRef.node));
    },
    VariableDeclarator(pathRef) {
      if (pathRef.node.id.type !== 'Identifier') return;
      const name = pathRef.node.id.name;
      const init = pathRef.node.init;
      if (!init) return;
      if (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression') {
        registerComponent(name, 'function', pathRef.node, extractParameterProps(init));
      } else if (init.type === 'CallExpression' && ['memo', 'forwardRef'].includes(init.callee.name)) {
        const inner = init.arguments[0];
        registerComponent(name, init.callee.name, pathRef.node, extractParameterProps(inner || {}));
      }
    },
    ClassDeclaration(pathRef) {
      registerComponent(pathRef.node.id?.name, 'class', pathRef.node);
    },
    ExportNamedDeclaration(pathRef) {
      const declaration = pathRef.node.declaration;
      if (declaration?.id?.name) exportMap.set(declaration.id.name, declaration.id.name);
      if (declaration?.type === 'VariableDeclaration') {
        for (const item of declaration.declarations) {
          if (item.id.type === 'Identifier') exportMap.set(item.id.name, item.id.name);
        }
      }
      for (const specifier of pathRef.node.specifiers) {
        const local = specifier.local?.name;
        const exported = specifier.exported?.name || specifier.exported?.value;
        if (local && exported) exportMap.set(local, exported);
      }
    },
    ExportDefaultDeclaration(pathRef) {
      const declaration = pathRef.node.declaration;
      if (declaration.type === 'Identifier') exportMap.set(declaration.name, 'default');
      else if (declaration.id?.name) exportMap.set(declaration.id.name, 'default');
      analysis.exports.push({ name: 'default', local: declaration.id?.name || declaration.name || 'anonymous', line: pathRef.node.loc?.start.line || 1 });
    },
    JSXOpeningElement(pathRef) {
      const name = jsxName(pathRef.node.name);
      if (!name || !/^[A-Z]/.test(name)) return;
      const currentElement = pathRef.parentPath?.isJSXElement() ? pathRef.parentPath : null;
      const parentElement = currentElement?.findParent((candidate) => candidate.isJSXElement());
      const parentName = parentElement ? jsxName(parentElement.node.openingElement.name) : '';
      const jsxAncestors = [];
      let cursor = currentElement?.parentPath;
      while (cursor) {
        if (cursor.isJSXElement()) {
          const ancestorName = jsxName(cursor.node.openingElement.name);
          if (ancestorName && ancestorName !== name && !jsxAncestors.includes(ancestorName)) jsxAncestors.push(ancestorName);
        }
        cursor = cursor.parentPath;
      }
      const props = pathRef.node.attributes.map((attribute) => {
        if (attribute.type === 'JSXSpreadAttribute') return { name: '...spread', value: `{${attribute.argument.type}}` };
        return { name: attribute.name.name, value: literalValue(attribute.value) };
      });
      analysis.usages.push({
        componentName: name,
        ownerComponent: nearestOwner(pathRef),
        parentJsx: parentName && parentName !== name ? parentName : '',
        jsxAncestors,
        line: pathRef.node.loc?.start.line || 1,
        column: pathRef.node.loc?.start.column || 0,
        start: currentElement?.node.start ?? pathRef.node.start,
        end: currentElement?.node.end ?? pathRef.node.end,
        props,
      });
    },
  });

  for (const [local, exported] of exportMap) {
    analysis.exports.push({ name: exported, local, line: componentMap.get(local)?.line || 1 });
    const component = componentMap.get(local);
    if (component) {
      component.exportNames.push(exported);
      component.isDefaultExport ||= exported === 'default';
    }
  }
  analysis.components = [...componentMap.values()];
  return analysis;
}
