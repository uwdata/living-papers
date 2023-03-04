import { DATA_ATTR } from '@living-papers/runtime';
import { aliasComponent, aliasProperty } from './alias.js';
import { htmlEscape } from '../../util/html-escape.js';

export function astMountHTML(ast) {
  const { html, attrs, events } = astToHTML(ast);
  const root = document.createElement('div');
  root.innerHTML = html;
  return { node: root.childNodes[0], attrs, events };
}

export function astToHTML(ast) {
  const ctx = {
    _id: 0,
    attrs: [],
    events: [],
    tags: new Set
  };
  return { html: renderNode(ast, ctx), ...ctx };
}

function renderNode(node, ctx) {
  const type = node.type;

  if (type === 'textnode') {
    return htmlEscape(node.value);
  }

  const name = aliasComponent(node.name);
  if (name == null) {
    return '';
  } else if (name === 'br') {
    return '<br/>';
  }

  ctx.tags.add(name); // track all tags used

  return '<' + name + renderProps(node.properties, ctx) + '>'
    + (node.children || []).map(c => renderNode(c, ctx)).join('')
    + '</' + name + '>';
}

function renderProps(props, ctx) {
  let str = '';
  if (!props) return str;

  let id = null;
  const _id = () => id || (id = `${++ctx._id}`);

  for (const propKey in props) {
    const { type, value } = props[propKey];
    const key = aliasProperty(propKey);
    if (!key) continue;

    if (type === 'variable' || type === 'expression') {
      ctx.attrs.push([_id(), key, value]);
    } else if (type === 'event') {
      ctx.events.push([_id(), key, value]);
    } else {
      str += ` ${key}="${htmlEscape(value)}"`;
    }
  }
  if (id !== null) {
    str = ` ${DATA_ATTR}="${id}"` + str;
  }
  return str;
}
