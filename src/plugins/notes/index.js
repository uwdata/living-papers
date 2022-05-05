import {
  createComponentNode, createProperties, queryNodes
} from '../../ast/index.js';

export default function(ast) {
  queryNodes(ast, node => node.name === 'note').forEach(node => {
    const { children } = node;

    if (children.length > 1) {
      console.warn('Dropping extraneous content from note.');
    }

    node.properties = createProperties({ class: 'note' });
    node.children = [
      createComponentNode('sup'),
      createComponentNode(
        'span',
        createProperties({ class: 'note-content' }),
        children?.[0]?.children
      )
    ];
  });
  return ast;
}
