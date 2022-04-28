export function bindAttr(runtime, node, attrName, expr) {
  runtime.define(expr, {
    fulfilled(value/*, name*/) {
      node.setAttribute(attrName, value);
    },
    error(error/*, name*/) {
      console.error(error);
    }
  });
}
