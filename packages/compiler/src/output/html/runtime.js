import path from 'node:path';
import { mkdirp, writeFile } from '../../util/fs.js';
import { astToModule } from './ast-to-script.js';

export default async function(ast, context, options) {
  const { outputDir } = context;
  const {
    jsFile = 'runtime.mjs',
  } = options;

  const { module } = astToModule(ast.article);

  const outputPath = path.join(outputDir, jsFile);
  await mkdirp(path.dirname(outputPath));
  await writeFile(outputPath, module);
  return outputPath;
}
