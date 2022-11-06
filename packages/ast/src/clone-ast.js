import { cloneNode } from './util.js';

export function cloneAST(ast) {
  return {
    metadata: { ...ast.metadata },
    article: cloneNode(ast.article)
  };
}
