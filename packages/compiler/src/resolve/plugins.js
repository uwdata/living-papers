import knitr from '../plugins/knitr/index.js';
import pyodide from '../plugins/pyodide/index.js';

export function resolvePlugins(plugins) {
  const list = [];
  for (const key in plugins) {
    if (plugins[key]) {
      list.push(resolvePlugin(key));
    }
  }
  return list;
}

export function resolvePlugin(name) {
  // TODO more sophisticated plugin resolution
  if (name === 'knitr') {
    return knitr;
  }
  if (name === 'pyodide') {
    return pyodide;
  }
  throw new Error(`Can not find plugin: ${name}`);
}