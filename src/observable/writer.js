import { compile } from './compiler.js';

const url = name => `https://api.observablehq.com/${name}.js?v=3`;
const def = (obs = '', args) => `  main.variable(observer(${obs})).define(${args});\n`;
const _viewof = name => `viewof ${name}`;
const _mutable = name => `mutable ${name}`;
const _initial = name => `initial ${name}`;

export function writeCells(codeCells) {
  const cells = codeCells.map(code => compile(code, true));
  let output = '';
  let i = 0;
  let v = 0;

  // output top-level import statements
  cells.forEach(cell => {
    if (!cell.import) return;
    output += `import define${++i} from "${url(cell.body.source.value)}";\n`;
  });
  if (i > 0) output += '\n';

  // output cell function definitions
  cells.forEach(cell => {
    if (cell.import) return;
    const { fnargs, body, async, generator } = cell;
    const fn = (async ? 'async ' : '') + 'function' + (generator ? '*' : '');
    output += `${fn} _${++v}(${fnargs.join(',')}){${body}}\n\n`;
  });

  // output module define function
  i = 0;
  v = 0;

  output += 'export default function define(runtime, observer) {\n'
    + '  const main = runtime.module();\n';

  cells.forEach(cell => {
    if (cell.import) {
      const { source, injections, specifiers } = cell.body;

      const inject = [];
      (injections || []).forEach(({ imported: { name }, local: { name: alias } }) => {
        if (name !== alias) {
          inject.push(`{ name: "${name}", alias: "${alias}" }`);
        }
      });

      output += `  const child${++i} = runtime.module(define${i})`
        + (inject.length ? `.derive([${inject.join(',')}], main);\n` : ';\n');

      specifiers.forEach(({ imported: { name }, local: { name: alias } }) => {
        const names = `"${name}"` + (name !== alias ? `, "${alias}"` : '');
        output += `  main.import(${names}, child${i});\n`;
      });
    } else {
      const { viewof, mutable, name, inputs } = cell;
      const deps = JSON.stringify(inputs);
      const nam = `"${name}"`;
      ++v;
      if (viewof) {
        const vof = `"${_viewof(name)}"`;
        output += def(vof, `${vof}, ${deps}, _${v}`);
        output += def('', `"${nam}", ["Generators", ${vof}], (G, _) => G.input(_)`);
      } else if (mutable) {
        const ini = `"${_initial(name)}"`;
        const mut = `"${_mutable(name)}"`;
        output += def('', `${ini}, ${deps}, _${v}`);
        output += def('', `${mut}, ["Mutable", ${ini}], (M, _) => new M(_)`);
        output += def(nam, `${nam}, [${mut}], _ => _.generator`);
      } else if (name) {
        output += def(nam, `${nam}, ${deps}, _${v}`);
      } else {
        output += def('', `${deps}, _${v}`);
      }
    }
  });

  output += '  return main;\n}';

  return output;
}
