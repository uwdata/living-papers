import { aliasComponent, aliasProperty } from './alias.js';
import { bindAssign } from './bind-assign.js';
import { bindAttr } from './bind-attr.js';

function htmlEscape(str) {
  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function astMountHTML(ast, root) {
  const { html, expr, assign } = astToHTML(ast);
  root.innerHTML = html;

  // bind attribute expressions
  expr.forEach(([id, name, expr]) => {
    const el = document.querySelector(`#${id}`);
    bindAttr(el, name, expr);
  });

  // bind assignment expressions
  assign.forEach(([id, event, name, expr]) => {
    const el = document.querySelector(`#${id}`);
    bindAssign(el, event, name, expr);
  });
}

export function astToHTML(ast) {
  const ctx = { _id: 0, get: [], set: [] };
  const html = renderNode(ast, ctx);
  return { html, expr: ctx.get, assign: ctx.set };
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
      ctx.get.push([id, key, value]);
    } else if (type === 'assign') {
      if (id == null) {
        id = `_id${++ctx._id}`;
      }
      for (const name in value) {
        ctx.set.push([id, key, name, value[name]]);
      }
    } else {
      str += ` ${key}="${value}"`;
    }
  }
  if (!props.id && id !== null) {
    str = ` id="${id}"` + str;
  }
  return str;
}
