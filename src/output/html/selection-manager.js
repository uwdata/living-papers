import { DATA_AST, DELIM_AST } from './constants.js';

const TEXT_NODE = 3;

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
  if (node.nodeType === TEXT_NODE && hasPath(node.parentNode)) {
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

// TODO: map AST range to DOM range?

function visitRangeNodes(domRange, visitor) {
  const ancestor = domRange.commonAncestorContainer;
  const start = domRange.startContainer;
  const end = domRange.endContainer;

	let stack = [];
	for (let node = start; node !== ancestor; node = node.parentNode) {
	  stack.push(node);
	}
	stack.push(ancestor);
  stack.reverse();
	for (let i = 0; i < stack.length - 1; ++i) {
		visitor(stack[i]);
	}

	handleStart(start, domRange.startOffset, visitor);

	while (stack.length) {
		let curr = stack.pop();
		while (curr = curr.nextSibling) {
		  if (curr === end) {
		    stack = [];
		    break;
		  }
		  visitor(curr);
		  if (curr.hasChildNodes()) {
        stack.push(curr);
        curr = curr.firstChild;
        if (curr == end) {
          stack = [];
        } else {
          visitor(curr);
          stack.push(curr);
        }
        break;
		  }
		}
	}

	handleEnd(end, domRange.endOffset, visitor);
}

function handleStart(node, offset, visitor) {
  if (node.nodeType === TEXT_NODE && offset > 0) {
    visitor(node.splitText(offset));
  } else {
	  visitor(node);
  }
}

function handleEnd(node, offset, visitor) {
	if (node.nodeType === TEXT_NODE && offset < node.nodeValue.length) {
    node.splitText(offset);
    visitor(node);
  } else {
	  visitor(node);
  }
}
