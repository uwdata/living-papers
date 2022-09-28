import { require } from 'd3-require';

const SCHEMA = 'dependencies';
const DEPS = Symbol('dependencies');
const LOAD = Symbol('load');
const TRUE = Promise.resolve(true);

const cache = new Map();

function resolver(name, version) {
  return path => `https://cdn.jsdelivr.net/npm/${name}@${version}/${path}`;
}

function style(href, doc = globalThis.document) {
  return new Promise(function(resolve, reject) {
    const link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onerror = reject;
    link.onload = resolve;
    doc.head.appendChild(link);
  });
}

function getDependencyBase(object) {
  let ctor = typeof HTMLElement !== 'undefined' && object instanceof HTMLElement
    ? object.constructor
    : object;
  while (ctor && !Object.hasOwn(ctor, SCHEMA)) {
    ctor = Object.getPrototypeOf(ctor);
    if (ctor && ctor.name === 'HTMLElement') return null;
  }
  return ctor;
}

export function hasDependencies(object) {
  const base = getDependencyBase(object);
  return !base || (base[DEPS]?.[LOAD] === TRUE);
}

export function getDependency(object, name) {
  return getDependencyBase(object)?.[DEPS]?.[name];
}

export function setDependencies(object, loaded) {
  const base = getDependencyBase(object);
  if (base) {
    const deps = base[DEPS] || (base[DEPS] = {});
    for (const name in loaded) {
      deps[name] = loaded[name];
    }
    deps[LOAD] = TRUE;
  }
}

export function loadDependencies(object) {
  const base = getDependencyBase(object);
  if (!base) return TRUE;

  // get dependency map, exit if load already began
  const deps = base[DEPS] || (base[DEPS] = {});
  if (deps[LOAD]) return deps[LOAD];

  // load dependent modules and css
  const load = { main: [], css: [] };
  const schema = base[SCHEMA];
  schema.forEach(({ name, version, main, css }) => {
    const resolve = resolver(name, version);
    const mainURI = resolve(main);
    const cssURI = resolve(css);

    const promise = cache.get(mainURI) || require(mainURI);
    cache.set(mainURI, promise);
    load.main.push(promise);

    if (css && !cache.has(cssURI)) {
      cache.set(cssURI, true);
      load.css.push(style(cssURI, object.ownerDocument));
    }
  });

  // once loaded, inject dependencies
  return deps[LOAD] = Promise.all(load.main.concat(load.css))
    .then(exports => {
      const map = schema.reduce((d, s, i) => (d[s.name] = exports[i], d), {});
      setDependencies(base, map);
    });
}
