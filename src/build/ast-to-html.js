import { aliasComponent, aliasProperty } from './alias.js';
import { htmlEscape } from '../util/html-escape.js';

export function astMountHTML(ast) {
  const { html, attrs, events } = astToHTML(ast);
  const root = document.createElement('div');
  root.innerHTML = html;
  return { node: root.childNodes[0], attrs, events };
}

export function astToHTML(ast) {
  const ctx = { _id: 0, attrs: [], events: [] };
  const html = renderNode(ast, ctx);
  return { html, ...ctx };
}

function renderNode(node, ctx) {
  const type = node.type;
  const name = aliasComponent(node.name);
  const props = node.properties;
  const children = node.children || [];

  if (type === 'textnode') {
    return htmlEscape(node.value);
  }

  return '<' + name
    + renderProps(props, ctx)
    + '>'
    + children.map(c => renderNode(c, ctx)).join('')
    + '</' + name + '>';
}

function renderProps(props, ctx) {
  let str = '';
  if (!props) return str;

  let id = props.id ? props.id.value : null;

  for (const propKey in props) {
    const { type, value } = props[propKey];
    const key = aliasProperty(propKey);

    if (type === 'variable' || type === 'expression') {
      if (id == null) {
        id = `_id${++ctx._id}`;
      }
      ctx.attrs.push([id, key, value]);
    } else if (type === 'event') {
      if (id == null) {
        id = `_id${++ctx._id}`;
      }
      ctx.events.push([id, key, value]);
    } else {
      str += ` ${key}="${value}"`;
    }
  }
  if (!props.id && id !== null) {
    str = ` id="${id}"` + str;
  }
  return str;
}
