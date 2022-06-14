import { appendChildren, createComponentNode, createProperties, getProperty, hasClass, hasProperty, queryNodes, removeClass, removeProperty, } from '../../ast/index.js';

export default function (ast, { logger }) {
  queryNodes(ast, node => hasProperty(node, 'sticky-until') || hasProperty(node, 'sticky-through')).forEach(node => {
    // move margin class, and sticky-until/sticky-through properties to containing parent node
    let classes = ['sticky'];
    if (hasClass(node, 'margin')) {
      classes.push('margin');
      removeClass(node, 'margin');
    }
    const properties = createProperties({ class: classes.join(' ') });
    if (hasProperty(node, 'sticky-until')) {
      properties['sticky-until'] = getProperty(node, 'sticky-until');
      removeProperty(node, 'sticky-until');
    } else if (hasProperty(node, 'sticky-through')) {
      properties['sticky-through'] = getProperty(node, 'sticky-through');
      removeProperty(node, 'sticky-through');
    }

    const parent = createComponentNode('div',
      properties,
      [
        { ...node } // shallow copy node
      ]
    );

    // replace node with parent, but keep reference the same
    node.type = parent.type;
    node.name = parent.name;
    node.properties = parent.properties;
    node.children = parent.children;
  });

  appendChildren(ast, createComponentNode('scroll-manager'));

  return ast;
}
