import {ObservableRuntime} from '../observable/runtime.js';

export function bindHandler(node, event, expr) {
  node.addEventListener(event, ObservableRuntime.instance().handler(expr));
}
