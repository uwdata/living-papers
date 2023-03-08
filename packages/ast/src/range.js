import { cloneNode, isTextNode } from './nodes.js';
import { getChildren } from './children.js';

/**
 * Create a range selection object indicating a subset of an AST.
 * @param {number[]} startPath The path to the range start node, as integer child indices.
 * @param {number} startOffset The offset in characters for the start of the range.
 * @param {number[]} endPath The path to the range end node, as integer child indices.
 * @param {number} endOffset The offset in characters for the end of the range.
 * @return A new range object.
 */
export function createRange(startPath, startOffset, endPath, endOffset) {
  return {
    startPath,
    startOffset,
    endPath,
    endOffset
  };
}

/**
 * Query an AST with a range selection, resulting in a new AST consisting
 * of the selection only.
 * @param {object} ast The AST to query.
 * @param {object} range The range selection to extract.
 * @return A new AST fragment with the content of the queried range.
 */
export function queryRange(ast, range) {
  const {
    startPath,
    startOffset,
    endPath,
    endOffset
  } = range;

  const ancestorPath = getAncestorPath(startPath, endPath);
  const ancestor = queryPath(ast, ancestorPath);

  const leftPath = startPath.slice(ancestorPath.length);
  const rightPath = endPath.slice(ancestorPath.length);
  const tree = cloneNode(ancestor);

  // prune right path to end node
  let rnode = tree;
  for (let i = 0; i < rightPath.length; ++i) {
    const idx = rightPath[i];
    const next = rnode.children[idx];
    if (idx < rnode.children.length) {
      rnode.children = rnode.children.filter((_, i) => i <= idx);
    }
    rnode = next;
  }

  // prune left path to start node
  let lnode = tree;
  for (let i = 0; i < leftPath.length; ++i) {
    const idx = leftPath[i];
    const next = lnode.children[idx];
    if (idx > 0) {
      lnode.children = lnode.children.filter((_, i) => i >= idx);
    }
    lnode = next;
  }

  // trim node text content
  const loffset = Math.max(0, startOffset || 0);
  const roffset = endOffset == null ? -1 : endOffset;
  if (lnode === rnode) {
    if (isTextNode(lnode)) {
      lnode.value = lnode.value.slice(loffset, roffset);
    }
  } else {
    if (isTextNode(lnode) && loffset > 0) {
      lnode.value = lnode.value.slice(loffset);
    }
    if (isTextNode(rnode) && roffset >= 0 && roffset < rnode.value.length) {
      rnode.value = rnode.value.slice(0, roffset);
    }
  }

  return tree;
}

function getAncestorPath(startPath, endPath) {
  const n = Math.min(startPath.length, endPath.length);
  let i = -1;
  while (++i < n && startPath[i] === endPath[i]);
  return startPath.slice(0, i);
}

/**
 * Returns the AST node corresponding to the given path.
 * @param {object} ast The AST to query.
 * @param {object} path The path to the node, as integer child indices.
 * @return The AST node at the given path coordinates.
 */
export function queryPath(ast, path) {
  const n = path.length;
  let node = ast;
  for (let i = 0; i < n; ++i) {
    node = getChildren(node)[path[i]];
  }
  return node;
}
