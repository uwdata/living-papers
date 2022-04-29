import { compile, handler } from '../observable/compile.js';
import { _api, _initial, _mutable, _viewof } from '../observable/util.js';

const OBSERVABLE = 'observable';
const DATA_CELL = 'data-cell';

const isTrue = b => (b + '').toLowerCase() === 'true';

export function astToScript(ast) {
  return { ast, script: generateScript(gatherCode(ast)) };
}

function gatherCode(ast) {
  return gatherHelper(ast, null, { cells: [], attrs: [], events: [] });
}

function gatherHelper(ast, parent, ctx) {
  if (ast.name === OBSERVABLE) {
    const code = ast.children[0].value.split(/\n\s*---+\s*\n/g);
    ctx.cells.push(...code);
    if (isTrue(ast.properties?.hide?.value)) { // remove hidden cells
      parent.children = parent.children.filter(c => c !== ast);
    } else {
      const props = ast.properties || (ast.properties = {});
      props[DATA_CELL] = {
        type: 'value',
        value: ctx.cells.length - 1
      };
      ast.children = null;
    }
  } else {
    const props = ast.properties;
    for (const key in props) {
      const { type, value } = props[key];
      if (type === 'expression' || type === 'variable') {
        ctx.attrs.push(value);
        props[key].value = ctx.attrs.length - 1;
      } else if (type === 'event') {
        ctx.events.push(value);
        props[key].value = ctx.events.length - 1;
      }
    }
  }

  // recurse
  if (ast.children) {
    ast.children.forEach(child => gatherHelper(child, ast, ctx));
  }

  return ctx;
}

function generateScript(ctx) {
  return [
    generate('cells', ctx.cells, compile),
    generate('attrs', ctx.attrs, compile),
    generate('event', ctx.events, handler)
  ].join('\n\n');
}

function generate(exportName, codeCells, compile) {
  const cells = codeCells.map(code => compile(code));
  let code = '';
  let i = 0;
  let v = 0;

  // generate import statements
  cells.forEach(cell => {
    if (!cell.import) return;
    code += `import define${++i} from "${_api(cell.body.source.value)}";\n`;
  });
  if (i > 0) code += '\n';

  code += `export function ${exportName}() {\n`

  // generate cell function definitions
  cells.forEach(cell => {
    if (cell.import) return;
    const { fnargs, body, async, generator } = cell;
    const fn = (async ? 'async ' : '') + 'function' + (generator ? '*' : '');
    code += `${fn} _${++v}(${fnargs.join(',')}){${body}}\n\n`;
  });

  // generate module definition
  i = 0;
  v = 0;
  const defs = [];
  cells.forEach((cell, idx) => {
    if (cell.import) {
      // load external module
      const { injections, specifiers } = cell.body;
      const inject = [];
      (injections || []).forEach(({ imported: { name }, local: { name: alias } }) => {
        if (name !== alias) inject.push({ name, alias });
      });
      defs.push({ module:`define${++i}`, id:i, inject });
      // import variables
      specifiers.forEach(({ imported: { name }, local: { name: alias } }) => {
        defs.push({ import: name, alias: alias, from: i });
      });
    } else {
      // define new variables
      const { viewof, mutable, name, inputs, vars } = cell;
      ++v;
      if (viewof) {
        const vof = _viewof(name);
        defs.push({ name: vof, inputs, defn: `_${v}`, cell: idx });
        defs.push({ name, inputs: ['Generators', vof], defn: '(G, _) => G.input(_)' });
      } else if (mutable) {
        const ini = _initial(name);
        const mut = _mutable(name);
        defs.push({ name: ini, inputs, defn: `_${v}` });
        defs.push({ name: mut, inputs: ['Mutable', ini], defn: '(M, _) => new M(_)' });
        defs.push({ name, inputs: [mut], defn: '_ => _.generator', cell: idx });
      } else {
        defs.push({ name, inputs, defn: `_${v}`, vars, cell: idx });
      }
    }
  });
  code += `return [\n`
    + defs.map(definition).join(',\n')
    + '\n];\n}';

  return code;
}

function definition(v) {
  let prop;
  if (v.defn) {
    const n = v.name ? `"${v.name}"` : 'null';
    const i = v.inputs?.length ? JSON.stringify(v.inputs) : '[]';
    prop = `define:[${n}, ${i}, ${v.defn}]`;
  } else if (v.module) {
    const i = v.inject && v.inject
      .map(o => `{name:"${o.name}",alias:"${o.alias}"}`).join(',');
    prop = `module:[${v.id}, ${v.module}${i ? `, ${i}` : ''}]`;
  } else if (v.import) {
    const a = v.alias && v.alias !== v.import ? `, "${v.alias}"` : ''
    prop = `import:[${v.from}, "${v.import}"${a}]`;
  }
  const cell = v.cell != null ? `, cell:${v.cell}` : '';
  return `  {${prop}${cell}}`;
}
