import {
  createProperties, getProperty, hasClass, hasProperty,
  queryNodes, removeClass, removeProperty
} from '../../ast/index.js';

const STICKY = 'sticky';
const STICKY_UNTIL = 'sticky-until';
const STICKY_THROUGH = 'sticky-through';
const MARGIN = 'margin';

export default function (ast, context) {
  const stickyNodes = queryNodes(
    ast,
    node => hasProperty(node, STICKY_UNTIL) || hasProperty(node, STICKY_THROUGH)
  );

  stickyNodes.forEach(node => updateStickyNode(node));

  context.sticky = stickyNodes.length > 0;

  return ast;
}

function updateStickyNode(node) {
  // move margin class, and sticky properties to containing parent node
  const classes = [ STICKY ];
  if (hasClass(node, MARGIN)) {
    classes.push(MARGIN);
    removeClass(node, MARGIN);
  }

  const properties = createProperties({
    class: classes.join(' ')
  });

  if (hasProperty(node, STICKY_UNTIL)) {
    properties[STICKY_UNTIL] = getProperty(node, STICKY_UNTIL);
    removeProperty(node, STICKY_UNTIL);
  } else if (hasProperty(node, STICKY_THROUGH)) {
    properties[STICKY_THROUGH] = getProperty(node, STICKY_THROUGH);
    removeProperty(node, STICKY_THROUGH);
  }

  // replace node with parent, but keep reference the same
  node.children = [ { ...node } ]; // shallow copy
  node.name = 'sticky';
  node.properties = properties;
}
