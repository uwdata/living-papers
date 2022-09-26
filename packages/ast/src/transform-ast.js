import { cloneNode } from './util.js';

export async function transformAST(ast, context, plugins) {
  ast = cloneNode(ast);
  for (const plugin of plugins) {
    ast = await plugin(ast, context);
  }
  return ast;
}
