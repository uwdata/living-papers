import { cloneNode } from './nodes.js';

export function cloneAST(ast) {
  const clone = {};
  for (const key in ast) {
    if (key === 'article') {
      clone[key] = cloneNode(ast[key]);
    } else {
      clone[key] = { ...ast[key] };
    }
  }
  return clone;
}
