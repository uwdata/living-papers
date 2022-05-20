import {
  createComponentNode, createProperties, getPropertyValue, queryNodes, setValueProperty
} from '../../ast/index.js';

export default function(ast, { logger }) {
  queryNodes(ast, node => {
    const hasMarginClass = node.properties?.layout?.value === 'margin';
    const isAsideNote = node.name === 'aside' && getPropertyValue(node, 'class')?.split(' ').includes('note');
    return hasMarginClass || isAsideNote;
  }).forEach(node => {
    const isAsideNote = node.name === 'aside' && getPropertyValue(node, 'class')?.split(' ').includes('note');

    const isSticky = node.properties?.['sticky-until-top'] || node.properties?.['sticky-until-bottom'];

    let className = 'margin';
    if (isSticky) {
      className += ' sticky';
    }

    if (isAsideNote) {
      // add margin class
      setValueProperty(node, 'class', getPropertyValue(node, 'class') + ' margin');
    } else {
      const parent = createComponentNode('div',
        createProperties({ class: className }),
        [
          {...node} // shallow copy node
        ]
      );
  
      // replace node with parent, but keep reference the same
      node.type = parent.type;
      node.name = parent.name;
      node.properties = parent.properties;
      node.children = parent.children;
    }

  });
  return ast;
}
