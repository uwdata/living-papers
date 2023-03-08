import { getNodeName, isTextNode } from './nodes.js';
import { getPropertyValue, hasProperty } from './properties.js';
import { getChildren } from './children.js';

export function extractText(ast) {
  if (ast == null) {
    return '';
  } else if (typeof ast === 'string') {
    return ast;
  } else if (isTextNode(ast)) {
    return ast.value;
  } else if (hasProperty(ast, 'code')) {
    return getPropertyValue(ast, 'code');
  } else if (ast.name === 'citelist') {
    return `[${extractInnerText(ast)}]`;
  } else if (ast.name === 'citeref') {
    return getPropertyValue(ast, 'key');
  } else if (ast.name === 'crossref') {
    return getPropertyValue(ast, 'xref');
  }
  return extractInnerText(ast);
}

export function extractInnerText(ast) {
  const inner = getChildren(ast).map(node => extractText(node)).join('');
  return inner + (getNodeName(ast) === 'p' ? '\n\n' : '');
}
