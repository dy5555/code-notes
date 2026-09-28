function safeIdentifier(value, fallback = 'GeneratedScreen') {
  const cleaned = String(value || '').replace(/[^A-Za-z0-9_$]/g, '');
  return /^[A-Za-z_$]/.test(cleaned) ? cleaned : fallback;
}

function collectImport(groups, info, fallbackName) {
  if (!info?.source) return;
  const group = groups.get(info.source) || { default: null, named: new Map() };
  if (info.imported === 'default' || info.kind === 'ImportDefaultSpecifier') group.default = info.local || fallbackName;
  else group.named.set(info.imported || fallbackName, info.local || fallbackName);
  groups.set(info.source, group);
}

function importLines(groups) {
  return [...groups.entries()].map(([source, group]) => {
    const named = [...group.named.entries()].map(([imported, local]) => imported === local ? imported : `${imported} as ${local}`);
    const clause = [group.default, named.length ? `{ ${named.join(', ')} }` : null].filter(Boolean).join(', ');
    return `import ${clause} from '${source}';`;
  });
}

function propValue(name, value, stateName, handlers) {
  if (name === 'value') return `={${stateName}}`;
  if (name === 'options' || /data|rows|items/i.test(name)) return '={[]}';
  if (/^on[A-Z]/.test(name)) {
    if (name === 'onChange') return `={set${stateName[0].toUpperCase()}${stateName.slice(1)}}`;
    const handler = `handle${name.slice(2)}`;
    handlers.add(handler);
    return `={${handler}}`;
  }
  if (typeof value === 'boolean') return value ? '' : '{false}';
  if (typeof value === 'number') return `{${value}}`;
  if (typeof value === 'string' && !value.startsWith('{') && !value.startsWith('[')) return `=${JSON.stringify(value)}`;
  return '={undefined}';
}

function componentBlock(node, index, states, handlers) {
  const name = node.component.name;
  const stateName = `${name[0].toLowerCase()}${name.slice(1)}Value${index || ''}`;
  const props = new Map((node.usage?.props || []).map((item) => [item.name, item.value]));
  for (const [key, value] of Object.entries(node.customProps || {})) props.set(key, value);
  if (props.has('value')) states.push({ name: stateName, initial: '' });
  const attributes = [...props.entries()].filter(([key]) => key !== '...spread').map(([key, value]) => {
    const rendered = propValue(key, value, stateName, handlers);
    return rendered === '' ? `      ${key}` : `      ${key}${rendered}`;
  });
  let jsx = `<${name}${attributes.length ? `\n${attributes.join('\n')}\n    ` : ''}/>`;
  for (const parent of node.includedParents || []) jsx = `<${parent}>\n      ${jsx.replace(/\n/g, '\n      ')}\n    </${parent}>`;
  return jsx;
}

export function generateJsx({ screenName, nodes }) {
  const componentName = safeIdentifier(screenName);
  const imports = new Map();
  const states = [];
  const handlers = new Set();
  const blocks = nodes.map((node, index) => {
    collectImport(imports, node.usage?.importInfo || {
      source: node.usage?.importSource,
      imported: node.component.isDefaultExport ? 'default' : (node.component.exportNames?.[0] || node.component.name),
      local: node.component.name,
    }, node.component.name);
    for (const parentName of node.includedParents || []) {
      const info = node.usage?.contextImports?.find((item) => item.name === parentName);
      collectImport(imports, info, parentName);
    }
    return componentBlock(node, index, states, handlers);
  });

  const lines = [`import { useState } from 'react';`, ...importLines(imports), '', `const ${componentName} = () => {`];
  for (const state of states) lines.push(`  const [${state.name}, set${state.name[0].toUpperCase()}${state.name.slice(1)}] = useState(${JSON.stringify(state.initial)});`);
  if (states.length) lines.push('');
  for (const handler of handlers) lines.push(`  const ${handler} = () => {`, '    // TODO: 업무 로직', '  };', '');
  lines.push('  return (', `    <div className="${componentName.toLowerCase()}-page">`);
  blocks.forEach((block) => lines.push(`      ${block.replace(/\n/g, '\n      ')}`));
  lines.push('    </div>', '  );', '};', '', `export default ${componentName};`, '');
  return lines.join('\n');
}
