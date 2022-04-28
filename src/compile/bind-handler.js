export function bindHandler(runtime, node, event, expr) {
  node.addEventListener(event, runtime.handler(expr));
}
