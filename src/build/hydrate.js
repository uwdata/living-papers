import { binding } from './binding.js';
import { CELL_VIEW, DATA_ATTR, DATA_BIND, DATA_CELL } from './constants.js';

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
  // collect input elements with declared bindings
  const bind = new Map;
  root.querySelectorAll(`[${DATA_BIND}]`).forEach(el => {
    const name = el.getAttribute(DATA_BIND);
    bind.has(name) ? bind.get(name).push(el) : bind.set(name, [el]);
  });

  // instantiate bindings
  const add = (b, el) => {
    el.tagName.toLowerCase() === CELL_VIEW ? b.addCell(el) : b.add(el);
  };
  bind.forEach((list, name) => {
    binding(runtime, name).then(b => {
      list.forEach(el => add(b, el))
    });
  })
}
