import { DATA_AST, DELIM_AST } from './constants.js';

export function astRange(domRange) {
  let startPath = resolveNode(domRange.startContainer);
  const startOffset = startPath ? domRange.startOffset : 0;
  if (!startPath) {
    startPath = findPath(domRange.startContainer, n => n.nextSibling);
  }

  let endPath = resolveNode(domRange.endContainer);
  const endOffset = endPath ? domRange.endOffset : -1;
  if (!endPath) {
    endPath = findPath(domRange.endContainer, n => n.prevSibling);
  }

  return { startPath, startOffset, endPath, endOffset };
}

function findPath(node, next) {
  // climb until a registered ancestor is found
  while (node.parentNode && !hasPath(node.parentNode)) {
    node = node.parentNode;
  }
  // search siblings for a registered node
  for (let curr = next(node); curr; curr = next(curr)) {
    const path = resolveNode(curr);
    if (path) return path;
  }
  // if search failure, return the ancestor
  resolveNode(node.parentNode);
}

function resolveNode(node) {
  if (node.nodeType === node.TEXT_NODE && hasPath(node.parentNode)) {
    return [ ...extractPath(node.parentNode), childIndex(node) ];
  } else if (hasPath(node)) {
    return extractPath(node);
  }
}

function hasPath(node) {
  return node && node.hasAttribute && node.hasAttribute(DATA_AST);
}

function extractPath(node) {
  const pstr = node.getAttribute(DATA_AST);
  return pstr.slice(DELIM_AST.length).split(DELIM_AST).map(x => +x);
}

function childIndex(node) {
  const list = node.parentNode.childNodes;
  const n = list.length;
  for (let i = 0; i < n; ++i) {
    if (list[i] === node) {
      return i;
    }
  }
  return -1;
}
