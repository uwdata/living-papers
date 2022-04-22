import { bindAssign } from './bind-assign.js';
import { bindAttr } from './bind-attr.js';

export function astToDOM(ast) {
  return createNode(ast);
}

const aliasMap = new Map()
  .set('observable', 'obs-cell')
  .set('math', 'tex-math')
  .set('equation', 'tex-equation');

function aliasComponent(name) {
  return aliasMap.get(name) || name;
}

function aliasProperty(name) {
  return name === 'className' ? 'class' : name;
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

  for (const key in props) {
    const { type, value } = props[key];
    if (type === 'variable' || type === 'expression') {
      bindAttr(node, key, value);
    } else if (type === 'assign') {
      for (const name in value) {
        bindAssign(node, key, name, value[name]);
      }
    } else {
      node.setAttribute(aliasProperty(key), value);
    }
  }

  children.forEach(child => {
    node.appendChild(createNode(child));
  });

  return node;
}
