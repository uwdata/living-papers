export function clearChildren(node, index = -1) {
  const nodes = node.childNodes;
  let i = nodes.length;
  while (i > index) node.removeChild(nodes[--curr]);
}
