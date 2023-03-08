import { getChildren } from './children.js';

/**
 * Perform a preorder depth-first traversal of the AST.
 * @param {object} node The AST node at which to begin the traversal.
 * @param {function} callack Callback function invoked for each visited node.
 *  The callback is invoked with two arguments: the current node, and its parent node.
 *  Traversal is aborted if the callback returns a truthy value.
 */
export function visitNodes(node, callback) {
  visitNodesHelper(node, null, callback);
}

function visitNodesHelper(node, parent, callback) {
  if (callback(node, parent)) {
    return true;
  }
  for (const child of getChildren(node)) {
    if (visitNodesHelper(child, node, callback)) {
      return true;
    }
  }
}

/**
 * Retrieve the first node that matches a given predicate function.
 * @param {object} node The AST node at which to begin searching.
 *  Only this node and its descendants are considered.
 * @param {function(object): boolean} predicate Filter function to test nodes.
 *  If the predicate returns true, the node is included in the result.
 * @returns {object} The first AST node that matches the predicate, or undefined.
 */
 export function queryNode(node, predicate) {
  let found;

  visitNodes(node, n => {
    if (predicate(n)) {
      found = n;
      return true;
    }
  });

  return found;
}

/**
 * Retrieve all nodes that match a given predicate function.
 * @param {object} node The AST node at which to begin searching.
 *  Only this node and its descendants are considered.
 * @param {function(object): boolean} predicate Filter function to test nodes.
 *  If the predicate returns true, the node is included in the result.
 * @returns {object[]} An array of AST nodes that match the predicate.
 */
export function queryNodes(node, predicate) {
  const nodes = [];

  visitNodes(node, n => {
    if (predicate(n)) {
      nodes.push(n);
    }
  });

  return nodes;
}
