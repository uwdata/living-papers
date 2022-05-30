import {
  addClass, appendChildren, createComponentNode, createProperties, getProperty, getPropertyValue, hasClass, hasProperty, queryNodes, removeProperty
} from '../../ast/index.js';

export default function (ast, { logger }) {
  queryNodes(ast, node => {
    const hasMarginProp = getPropertyValue(node, 'layout') === 'margin';
    const isAsideNote = node.name === 'aside' && hasClass(node, 'note');
    const isSticky = hasProperty(node, 'sticky-until-top') || hasProperty(node, 'sticky-until-bottom');
    return hasMarginProp || isAsideNote || isSticky;
  }).forEach(node => {
    const hasMarginProp = getPropertyValue(node, 'layout') === 'margin';
    const isAsideNote = node.name === 'aside' && hasClass(node, 'note');
    const isSticky = hasProperty(node, 'sticky-until-top') || hasProperty(node, 'sticky-until-bottom');

    let classes = [];
    if (hasMarginProp || isAsideNote) {
      classes.push('margin');
    }
    if (isSticky) {
      classes.push('sticky');
    }

    if (isAsideNote) {
      // add margin class
      for (const c of classes) {
        addClass(node, c)
      }
    } else {
      const properties = createProperties({ class: classes.join(' ') });
      if (hasProperty(node, 'sticky-until-top')) {
        properties['sticky-until-top'] = getProperty(node, 'sticky-until-top');
        removeProperty(node, 'sticky-until-top');
      }
      if (hasProperty(node, 'sticky-until-bottom')) {
        properties['sticky-until-bottom'] = getProperty(node, 'sticky-until-bottom');
        removeProperty(node, 'sticky-until-bottom');
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
    }
  });

  appendChildren(ast, createComponentNode('scroll-manager'));

  return ast;
}
