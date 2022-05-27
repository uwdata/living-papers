import { aliasComponent, aliasProperty } from './alias.js';

export function astToDOM(ast) {
  const ctx = { attrs: [], events: [], tags: new Set };
  return { node: createNode(ast, ctx), ...ctx };
}

function createNode(ast, ctx) {
  const type = ast.type;

  if (type === 'textnode') {
    return document.createTextNode(ast.value);
  }

  const name = aliasComponent(ast.name);
  if (name == null) {
    return null;
  }

  const props = ast.properties;
  const children = ast.children || [];
  const node = document.createElement(name);
  ctx.tags.add(name);

  for (const propKey in props) {
    const { type, value } = props[propKey];
    const key = aliasProperty(propKey);

    if (type === 'variable' || type === 'expression') {
      ctx.attrs.push([node, key, value]);
    } else if (type === 'event') {
      ctx.events.push([node, key, value]);
    } else {
      node.setAttribute(key, value);
    }
  }

  children.forEach(child => {
    const dom = createNode(child, ctx);
    if (dom) node.appendChild(dom);
  });

  return node;
}
