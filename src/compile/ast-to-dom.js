import { aliasComponent, aliasProperty } from './alias.js';
import { bindAttr } from './bind-attr.js';
import { bindHandler } from './bind-handler.js';

export function astToDOM(ast) {
  return createNode(ast);
}

function createNode(ast) {
  const type = ast.type;
  const name = aliasComponent(ast.name);
  const props = ast.properties;
  const children = ast.children || [];

  if (type === 'textnode') {
    return document.createTextNode(ast.value);
  }

  const node = document.createElement(name);

  for (const propKey in props) {
    const { type, value } = props[propKey];
    const key = aliasProperty(propKey);

    if (type === 'variable' || type === 'expression') {
      bindAttr(node, key, value);
    } else if (type === 'handler') {
      bindHandler(node, key, value);
    } else {
      node.setAttribute(key, value);
    }
  }

  children.forEach(child => {
    node.appendChild(createNode(child));
  });

  return node;
}
