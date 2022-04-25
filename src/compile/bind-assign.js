import { ObservableRuntime } from '../observable/runtime.js';

const msg = type => `Bound event handlers can not be ${type} functions.`;
let _handler_id = 0;

export function bindAssign(node, event, name, expr) {
  const runtime = ObservableRuntime.instance();

  // define handler within Observable runtime
  const id = `__event${++_handler_id}__`;
  runtime.define(`${id} = ${expr}`, null, {
    transform(body, cell) {
      if (cell.generator) throw new Error(msg('generator'));
      if (cell.async) throw new Error(msg('async'));
      switch (cell.body.type) {
        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
        case 'FunctionDeclaration':
          return body;
        default:
          return `return(\n() => {${body}}\n)`;
      }
    }
  });

  // TODO: this kind of sanitization could occur earlier
  if (event.startsWith('on')) {
    event = event.slice(2);
  }
  event = event.toLowerCase();

  node.addEventListener(event, async (e) => {
    const v = (await runtime.main.value(id))(e);
    runtime.redefine(name, v);
  });
}
