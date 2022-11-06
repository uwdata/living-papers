export async function transformAST(ast, context, plugins) {
  for (const plugin of plugins) {
    ast = await plugin(ast, context);
  }
  return ast;
}
