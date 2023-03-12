import path from 'node:path';
import { readFile } from '../util/fs.js';

export async function resolveTransforms(transforms, context) {
  const { inputDir, logger, resolve } = context;

  const paths = [
    '@living-papers/transforms',
    path.resolve(inputDir),
    // TODO extract package key from transform metadata entry?
    // ...(transforms || []).flatMap(t => t.package)
  ].map(p => resolve(p));

  const map = new Map;

  for (const pkgPath of paths) {
    // load component manifest
    let defs = [];
    try {
      const pkg = JSON.parse(await readFile(pkgPath));
      defs = pkg?.['living-papers']?.transforms || [];
    } catch (err) {
      // fail silently for now
      // TODO? error messaging
    }

    // gather component entries
    const dir = path.dirname(pkgPath);
    for (const item of defs) {
      try {
        const entry = await loadTransform(item, dir);
        map.set(item.name, entry);
      } catch (err) {
        logger.error(err.message);
      }
    }
  }

  const list = [];
  for (const key in transforms) {
    if (transforms[key] && map.has(key)) {
      list.push(map.get(key));
    }
  }

  return list;
}

async function loadTransform(item, dir) {
  const file = path.resolve(path.join(dir, item.file));
  const module = await import(file);
  // TODO support named imports as part of item?
  return module.default;
}
