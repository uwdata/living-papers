import {ObservableRuntime} from '../observable/runtime.js';

export function bindAttr(node, attrName, expr) {
  ObservableRuntime.instance().define(expr, {
    fulfilled(value, name) {
      node.setAttribute(attrName, value);
    },
    error(error, name) {
      console.error(error);
    }
  });
}
