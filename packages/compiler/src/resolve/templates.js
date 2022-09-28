import path from 'node:path';
import { readFile } from '../util/fs.js';

export async function resolveTemplate(template = {}, type, context) {
  const DEFAULT_NAME = 'article';
  const DEFAULT_PACKAGE = `@living-papers/${type}-templates`;
  const { logger, resolve } = context;

  if (typeof template === 'string') {
    template = { name: template };
  }

  const {
    name = DEFAULT_NAME,
    package: _package = DEFAULT_PACKAGE
  } = template;

  try {
    const packageFile = resolve(name, _package ? `${_package}/` : '');
    const pkg = JSON.parse(await readFile(packageFile));
    return { ...pkg, dir: path.dirname(packageFile) };
  } catch (err) {
    logger.error(err.message);
  }
}
