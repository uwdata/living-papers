import {
  createComponentNode, createProperties, createTextNode, replaceChild,
  setValueProperty, visitNodes
} from '@living-papers/ast';

// TODO pass in from context?
const aliases = new Map([
  ['abstract', 'Abstract'],
  ['acknowledgments', 'Acknowledgments'],
  ['appendix', null],
  ['references', 'References']
]);

function isHeader(node) {
  return node.name && /h\d/.test(node.name);
}

// TODO maintain one-to-one top-level AST mapping (div.name)?
export default function(ast) {
  visitNodes(ast.article, (node, parent) => {
    if (aliases.has(node.name)) {
      // special sections should not contain normally numbered sections
      const prop = node.name === 'appendix' ? 'appendix' : 'nonumber';
      visitNodes(node, child => {
        if (isHeader(child)) {
          setValueProperty(child, prop, true);
        }
      });

      // extract section content
      // add a header if alias is defined
      const alias = aliases.get(node.name);
      const header = alias ? [
        createComponentNode(
          'h1',
          createProperties({ nonumber: true }),
          [ createTextNode(alias) ]
        )
      ] : [];
      replaceChild(parent, node, [...header, ...node.children]);
    }
  });
  return ast;
}
