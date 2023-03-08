/**
 * Retrieve the children nodes of a parent node.
 * This method returns a direct reference to an underlying child
 * array. Callers should take care not to modify the returned array.
 * @param {object} node The parent node.
 * @return {object[]} The children of the node, or an empty array if none.
 */
 export function getChildren(node) {
  return node.children || [];
}

/**
 * Append one or more child nodes to a parent node.
 * @param {object} node The parent AST node.
 * @param {...(object|object[])} children The children AST nodes to append.
 * @return {object} A modified AST node.
 */
export function appendChildren(node, ...children) {
  node.children = (node.children || []).concat(children.flat());
  return node;
}

/**
 * Prepend one or more child nodes to a parent node.
 * @param {object} node The parent AST node.
 * @param {...(object|object[])} children The children AST nodes to prepend.
 * @return {object} A modified AST node.
 */
export function prependChildren(node, ...children) {
  node.children = children.flat().concat(node.children || []);
  return node;
}

/**
 * Remove a child node from a parent node.
 * @param {object} node The parent AST node.
 * @param {object} child The child AST node to remove.
 * @return {object} A modified AST node.
 */
export function removeChild(node, child) {
  if (node.children) {
    node.children = node.children.filter(n => n !== child);
  }
  return node;
}

/**
 * Replace a child node for a parent node with new content.
 * @param {object} node The parent AST node.
 * @param {object} child The child AST node to replace.
 * @param {...(object|object[])} insert The new child AST nodes to insert.
 * @return {object} A modified AST node.
 */
 export function replaceChild(node, child, insert) {
  if (node.children) {
    node.children = node.children
      .map(n => n === child ? insert : n)
      .flat();
  }
  return node;
}
