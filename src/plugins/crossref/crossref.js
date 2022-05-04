import {
  getNodeName,
  getPropertyValue,
  setValueProperty,
  visitNodes
} from '../../ast/index.js';

const CROSSREF = 'cross-ref';
const XREF = 'xref';
const INDEX = 'index';

export default function(lookup) {
  return function(ast) {
    visitNodes(ast, node => {
      const name = getNodeName(node);
      if (name !== CROSSREF) return;
      const key = getPropertyValue(node, XREF);
      const index = lookup.get(key);
      setValueProperty(node, INDEX, index);
    });
    return ast;
  };
}
