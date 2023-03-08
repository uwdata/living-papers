import path from 'node:path';
import { cloneAST, transformAST } from '@living-papers/ast';
import { convertFigures } from '../../plugins/index.js';
import { copy, mkdirp, writeFile } from '../../util/fs.js';
import { bundleJS } from '../bundler.js';

export default async function(ast, context, options) {
  const { output } = context;
  const { figures = true, ...esmOptions } = options;
  ast = await transformAST(
    cloneAST(ast),
    context,
    figures ? [
      convertFigures({...(options.convert || {}), html: output.html})
    ] : []
  );
  return outputESM(ast, context, esmOptions);
}

export async function outputESM(ast, context, options) {
  const { inputFile, outputDir, tempDir } = context;
  const {
    jsFile = `${path.parse(inputFile).name}.mjs`,
    ...rollupOptions
  } = options;

  // set up path variables
  const outputPath = path.join(outputDir, jsFile);
  const entryPath = path.join(tempDir, 'entry-esm.js');
  const jsPath = path.join(tempDir, jsFile);

  // create directories
  await Promise.all([
    mkdirp(outputDir),
    mkdirp(tempDir)
  ]);

  // generate javascript module code
  await writeFile(
    entryPath,
    entryScript({ ast, context })
  );

  // bundle module
  await bundleJS({ ...rollupOptions, input: entryPath, output: jsPath });

  // copy result to output location
  copy(jsPath, outputPath);
  return outputPath;
}

function entryScript({ ast }) {
  const script = [];
  script.push(`import { Paper } from '@living-papers/paper-api';`);
  script.push(`export default new Paper(${JSON.stringify(ast)});`);
  return script.join('\n');
}
