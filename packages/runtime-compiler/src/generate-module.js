const _api = name => `https://api.observablehq.com/${name}.js?v=3`;
const _initial = name => `initial ${name}`;
const _mutable = name => `mutable ${name}`;
const _viewof = name => `viewof ${name}`;

export function generateModule(exportName, codeCells, compile) {
  let code = '';
  let i = 0;
  let v = 0;

  if (!codeCells?.length) {
    return '';
  }

  const cells = codeCells.map(compile);

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
    prop = `module:[${v.id}, ${v.module}${i ? `, [${i}]` : ''}]`;
  } else if (v.import) {
    const a = v.alias && v.alias !== v.import ? `, "${v.alias}"` : ''
    prop = `import:[${v.from}, "${v.import}"${a}]`;
  }
  const cell = v.cell != null ? `, cell:${v.cell}` : '';
  return `  {${prop}${cell}}`;
}
