import path from 'node:path';
import { createRequire } from 'node:module';
import { URL, fileURLToPath } from 'node:url';
import { readFile } from '../util/fs.js';

// https://html.spec.whatwg.org/#valid-custom-element-name
const illegalNames = new RegExp('^' + [
  'annotation-xml',
  'color-profile',
  'font-face',
  'font-face-src',
  'font-face-uri',
  'font-face-format',
  'font-face-name',
  'missing-glyph'
].join('|') + '$');

export async function components(context) {
  const { inputDir, logger, metadata } = context;

  const paths = componentPaths([
    fileURLToPath(new URL('../components', import.meta.url)),
    path.resolve(inputDir),
    path.resolve(path.join(inputDir, 'components')),
    ...(metadata.components || [])
  ]);

  const map = new Map;

  for (const dir of paths) {
    // load component manifest
    const pkgPath = path.join(dir, 'package.json');
    let list = [];
    try {
      const pkg = JSON.parse(await readFile(pkgPath));
      list = pkg?.['living-papers']?.components || [];
    } catch (err) {
      // fail silently for now
      // TODO? error messaging
    }

    // gather component entries
    list.forEach(item => {
      try {
        const entry = toEntry(item, dir);
        map.set(entry.name, entry);
      } catch (err) {
        logger.error(err.message);
      }
    });
  }

  return Array.from(map.values());
}

function componentPaths(spec) {
  const { resolve } = createRequire(import.meta.url);
  return spec.map(
    id => /^(?:\.\/|\.\.\/|\/)/.test(id) ? id : resolve(id)
  );
}

function toEntry(item, dir) {
  const type = typeof item;
  const entry = type === 'object' ? item
    : type === 'string' ? { name: item.toLowerCase(), file: `${item}.js` }
    : null;

  if (!entry
      || typeof entry.name !== 'string'
      || (typeof entry.import !== 'string' && entry.import != null)
      || typeof entry.file !== 'string'
  ) {
    throw new Error(`Malformed component entry: ${JSON.stringify(entry)}`);
  }

  const { name, import: _import = 'default', file } = entry;
  const _default = _import === 'default';

  if (name.indexOf('-') < 0) {
    throw new Error(`Component name must contain a dash: ${name}`);
  } else if (illegalNames.test(name)) {
    throw new Error(`Component name can not be: ${name}`);
  }

  return {
    name,
    import: _default ? toCamelCase(name) : _import,
    default: _default,
    file: path.join(dir, file)
  };
}

function toCamelCase(name) {
  return name
    .split('-')
    .map(s => s[0].toUpperCase() + s.slice(1).toLowerCase())
    .join('');
}
