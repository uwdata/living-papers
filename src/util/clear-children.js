export function clearChildren(node, index = 0) {
  const nodes = node.childNodes;
  let i = nodes.length;
  while (i > index) node.removeChild(nodes[--i]);
}
