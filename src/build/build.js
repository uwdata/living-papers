import { ObservableRuntime } from '../observable/runtime.js';
import { astToDOM } from './ast-to-dom.js';
import { astToScript } from './ast-to-script.js';

export function buildArticle(ast, {
  builder = astToDOM,
  runtime = new ObservableRuntime
} = {}) {
  const { script } = astToScript(ast);
  const { node, attrs, events } = builder(ast);

  return import(dataURI(script)).then(module => {
    runtime.define(module.cells(), observeCells(node));
    runtime.define(module.attrs(), observeAttrs(node, attrs));
    runtime.define(module.event(), observeEvent(node, events, runtime));
    return node;
  });
}

function dataURI(code) {
  return 'data:text/javascript;charset=utf-8;base64,' + btoa(code);
}

function resolveElement(root, el) {
  return typeof el === 'object' ? el : root.querySelector(`#${el}`);
}

function observeCells(root) {
  const map = new Map;
  root.querySelectorAll('cell-view').forEach(node => {
    map.set(+node.getAttribute('data-cell'), node.observer);
  });
  return def => map.get(def.cell);
}

function observeAttrs(root, attrs) {
  return def => {
    const [target, name] = attrs[def.cell];
    const node = resolveElement(root, target);
    return {
      fulfilled(value) {
        node.setAttribute(name, value);
      },
      rejected(err) {
        console.error(err);
      }
    };
  };
}

function observeEvent(root, event, runtime) {
  return def => {
    const { define: [id], cell } = def;
    const [source, name] = event[cell];
    const node = resolveElement(root, source);
    node.addEventListener(name, runtime.handler(id));
    return {
      rejected(err) {
        console.error(err);
      }
    };
  };
}
