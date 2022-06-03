import {
  hasClass, queryNodes
} from '../../ast/index.js';

export default function (ast, { logger }) {
  queryNodes(ast, node => {
    return node.name === 'inlinenote' || hasClass(node, 'note')
  }).forEach(node => {
    const { children } = node;

    if (node.name === 'inlinenote') {
      if (children.length > 1) {
        logger.warn('Dropping extraneous content from inline note.');
      }

      node.name = 'inline-note';
      node.children = children?.[0].children;
    } else { // aside note
      node.name = 'aside';
    }
  });
  return ast;
}
