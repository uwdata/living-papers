import {ObservableRuntime} from '../observable/runtime.js';

export function bindAssign(node, event, name, expr) {
  const runtime = ObservableRuntime.instance();
  let _value;

  // TODO: check for async issues (e.g., pending when event files)
  runtime.define(expr, {
    fulfilled(value/*, name*/) {
      _value = value;
    },
    error(error/*, name*/) {
      console.error(error);
    }
  });

  if (event.startsWith('on')) {
    event = event.slice(2);
  }
  event = event.toLowerCase();

  node.addEventListener(event, () => runtime.redefine(name, _value));
}
