import { visitNodes } from './visit.js';

/**
 * Add parentNode properties to all AST nodes.
 * @param {object} node the root node under which to add parentNode properties.
 */
export function setParentNodes(node) {
  visitNodes(node, (node, parent) => {
    node.parentNode = parent;
  });
}
