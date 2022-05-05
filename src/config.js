import path from 'node:path';
import { URL, fileURLToPath } from 'node:url';

export function numbered() {
  return ['figure', 'table', 'equation']
}

export function parseContext() {
  return {
    alias: [
      ['js', 'cell-view']
    ],
    fence: ['figure', 'table'],
    block: ['equation', 'cell-view', 'js'],
    cite: ['doi'],
    xref: ['sec', 'fig', 'tbl', 'eqn'],
    env: ['figure', 'table']
  };
}

export function builtins() {
  const dir = fileURLToPath(new URL('./components', import.meta.url));
  const names = [
    'cell-view',
    'cite-bib',
    'cite-ref',
    'cite-list',
    'code-block',
    'cross-ref',
    'figure-env',
    'range-text',
    'tex-math',
    'tex-equation'
  ];
  return names.map(name => {
    return {
      name,
      exported: name.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(''),
      path: path.join(dir, `${name}.js`)
    };
  });
}