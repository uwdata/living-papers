import { setValueProperty } from '@living-papers/ast';
import { CELL_VIEW, DATA_CELL } from '@living-papers/runtime';
import { compile, generateModule, generateObservableModule, handler, splitCodeCells } from '@living-papers/runtime-compiler';

const isTrue = b => String(b).toLowerCase() === 'true';

export function astToScript(ast) {
  return { ast, script: generateScript(gatherCode(ast)) };
}

export function astToModule(ast) {
  const { cells } = gatherCode(ast);
  const module = generateObservableModule(cells, compile);
  return { ast, module };
}

function gatherCode(ast) {
  return gatherHelper(ast, null, { cells: [], attrs: [], events: [] });
}

function gatherHelper(ast, parent, ctx) {
  if (ast.name === CELL_VIEW) {
    const code = splitCodeCells(ast.children[0].value);
    ctx.cells.push(...code);
    if (isTrue(ast.properties?.hide?.value)) { // remove hidden cells
      parent.children = parent.children.filter(c => c !== ast);
    } else {
      setValueProperty(ast, DATA_CELL, ctx.cells.length - 1);
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
    generateModule('cells', ctx.cells, compile),
    generateModule('attrs', ctx.attrs, compile),
    generateModule('event', ctx.events, handler)
  ].filter(s => s).join('\n\n');
}
