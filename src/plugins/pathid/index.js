import { getChildren, setValueProperty } from '../../ast/index.js';

const DATA_AST = 'data-ast';
const DELIM_AST = '/';

export default function(ast) {
  pathId(ast, []);
  return ast;
}

function pathId(ast, path) {
  setValueProperty(ast, DATA_AST, DELIM_AST + path.join(DELIM_AST));
  getChildren(ast).forEach((child, index) => {
    path.push(index);
    pathId(child, path);
    path.pop();
  });
}
