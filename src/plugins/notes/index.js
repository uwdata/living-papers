import {
  createComponentNode, createProperties, createTextNode, hasClass, queryNodes
} from '../../ast/index.js';

export default function (ast, { logger }) {
  let numNotes = 0;
  queryNodes(ast, node => {
    return node.name === 'inlinenote' || hasClass(node, 'note')
  }).forEach(node => {
    const { children } = node;

    if (node.name === 'inlinenote') {
      if (children.length > 1) {
        logger.warn('Dropping extraneous content from note.');
      }

      node.properties = createProperties({ class: 'inlinenote' });
      node.children = [
        createComponentNode('sup', createProperties({ class: 'inlinenote-number' }), [createTextNode(`[${++numNotes}]`)]),
        createComponentNode(
          'span',
          createProperties({ class: 'note margin', "data-number": numNotes }),
          children?.[0]?.children
        )
      ];
    } else { // aside note
      node.name = 'aside';
    }
  });
  return ast;
}
