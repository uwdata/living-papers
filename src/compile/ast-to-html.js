import { aliasComponent, aliasProperty } from './alias.js';
import { bindAttr } from './bind-attr.js';
import { bindHandler } from './bind-handler.js';
import { htmlEscape } from '../util/html-escape.js';

export function astMountHTML(ast, root, runtime) {
  const { html, expr, handler } = astToHTML(ast);
  root.innerHTML = html;

  // bind attribute expressions
  expr.forEach(([id, name, expr]) => {
    const el = root.querySelector(`#${id}`);
    bindAttr(runtime, el, name, expr);
  });

  // bind event handlers
  handler.forEach(([id, event, expr]) => {
    const el = root.querySelector(`#${id}`);
    bindHandler(runtime, el, event, expr);
  });
}

export function astToHTML(ast) {
  const ctx = { _id: 0, expr: [], handler: [] };
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
      ctx.expr.push([id, key, value]);
    } else if (type === 'handler') {
      if (id == null) {
        id = `_id${++ctx._id}`;
      }
      ctx.handler.push([id, key, value]);
    } else {
      str += ` ${key}="${value}"`;
    }
  }
  if (!props.id && id !== null) {
    str = ` id="${id}"` + str;
  }
  return str;
}
