import {
  getNodeName,
  getPropertyValue,
  setValueProperty,
  visitNodes
} from '@living-papers/ast';

const CROSSREF = 'crossref';
const XREF = 'xref';
const INDEX = 'index';

export default function(lookup) {
  return function(ast, { logger }) {
    visitNodes(ast.article, node => {
      const name = getNodeName(node);
      if (name === CROSSREF) {
        const key = getPropertyValue(node, XREF);
        if (lookup.has(key)) {
          setValueProperty(node, INDEX, lookup.get(key));
        } else {
          logger.warn(`Cross-reference key not found: ${key}`);
        }
      }
    });
    return ast;
  };
}
