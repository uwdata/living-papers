import { getClasses } from './classes.js';

export function namespace(name, defaultValue = null) {
  const idx = name ? name.indexOf(':') : -1;
  return idx < 0 ? defaultValue : name.slice(0, idx);
}

export function excludesNamespace(node, ns) {
  if (namespace(node.name, ns) !== ns) {
    return true;
  }
  for (const cls of getClasses(node)) {
    if (cls.endsWith(':only')) {
      return namespace(cls) !== ns;
    }
  }
  return false;
}
