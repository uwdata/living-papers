import { binding } from './binding.js';
import { CELL_VIEW, DATA_ATTR, DATA_BIND, DATA_BIND_SET, DATA_CELL } from './constants.js';
import { Observer, FULFILLED, REJECTED } from './observer.js';

export function hydrate(runtime, root, module, bind = {}) {
  const {
    cells = () => [],
    attrs = () => [],
    event = () => []
  } = module;

  const resolve = resolver(root);
  runtime.define(cells(), observeCells(root));
  runtime.define(attrs(), observeAttrs(resolve, bind.attrs));
  runtime.define(event(), observeEvent(resolve, bind.events, runtime));
  createBindings(root, runtime);
}

function resolver(root) {
  const map = new Map;
  root.querySelectorAll(`[${DATA_ATTR}]`).forEach(node => {
    map.set(node.getAttribute(DATA_ATTR), node);
  });
  return el => typeof el === 'object' ? el : map.get(el);
}

function observeCells(root) {
  const map = new Map;
  root.querySelectorAll(CELL_VIEW).forEach(node => {
    map.set(+node.getAttribute(DATA_CELL), node.observer);
  });
  return def => map.get(def.cell);
}

function observeAttrs(resolve, attrs) {
  return def => {
    const [target, name] = attrs[def.cell];
    const node = resolve(target);
    const observer = new Observer((status, value) => {
      if (status === FULFILLED) {
        node.setAttribute(name, attrValue(value));
      } else if (status === REJECTED) {
        console.error(value.error);
      }
    });
    node.observers = node.observers || new Map;
    node.observers.set(name, observer);
    return observer;
  };
}

function attrValue(value) {
  return typeof value === 'object' ? JSON.stringify(value) : value;
}

function observeEvent(resolve, event, runtime) {
  return def => {
    const { define: [id], cell } = def;
    const [source, name] = event[cell];
    const node = resolve(source);
    node.addEventListener(name, runtime.handler(id));
    return {
      rejected(err) {
        console.error(err);
      }
    };
  };
}

function createBindings(root, runtime) {
  const bind = new Map;

  // collect input elements with declared bindings
  const process = (attr, override) => {
    root.querySelectorAll(`[${attr}]`).forEach(el => {
      const name = el.getAttribute(attr);
      const input = { el, override };
      bind.has(name) ? bind.get(name).push(input) : bind.set(name, [input]);
    });
  };
  process(DATA_BIND, false);
  process(DATA_BIND_SET, true);

  // instantiate bindings
  const add = (binding, { el, override }) => {
    el.tagName.toLowerCase() === CELL_VIEW
      ? binding.addCell(el, { override })
      : binding.add(el, { override });
  };
  bind.forEach((list, name) => {
    binding(runtime, name).then(binding => {
      list.forEach(input => add(binding, input))
    });
  });
}
