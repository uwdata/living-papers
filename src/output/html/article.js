import { ObservableRuntime } from '../../runtime/runtime.js';
import { hydrate } from './hydrate.js';
import { astToDOM } from './ast-to-dom.js';
import { astToScript } from './ast-to-script.js';
import { reference } from './reference.js';

export function article(ast, {
  builder = astToDOM,
  runtime = new ObservableRuntime
} = {}) {
  const { script } = astToScript(ast.article);
  const { node, ...bind } = builder(ast.article);
  return import(dataURI(script)).then(module => {
    hydrate(runtime, node, module, bind);
    const refs = ast.metadata.references;
    if (refs) reference(node, refs);
    return node;
  });
}

function dataURI(code) {
  return 'data:text/javascript;charset=utf-8;base64,' + btoa(code);
}
