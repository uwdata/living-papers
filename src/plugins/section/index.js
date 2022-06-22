import {
  createComponentNode, createProperties, createTextNode, replaceChild, visitNodes
} from '../../ast/index.js';

// TODO pass in from context?
const aliases = new Map([
  ['abstract', 'Abstract'],
  ['acknowledgments', 'Acknowledgments'],
  ['references', 'References']
]);

// TODO maintain one-to-one top-level AST mapping (div.name)?
export default function(ast) {
  visitNodes(ast, (node, parent) => {
    if (aliases.has(node.name)) {
      const alias = aliases.get(node.name);
      replaceChild(parent, node, [
        createComponentNode(
          'h1',
          createProperties({ nonumber: true }),
          [ createTextNode(alias) ]
        ),
        ...node.children
      ]);
    }
  });
  return ast;
}
