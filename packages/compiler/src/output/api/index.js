import path from 'node:path';
import { cloneAST, transformAST } from '@living-papers/ast';
import { convertFigures } from '../../transforms/index.js';
import { copy, mkdirp, writeFile } from '../../util/fs.js';
import { bundleJS } from '../bundler.js';

export default async function(ast, context, options) {
  const { output } = context;
  const { figures = true, ...apiOptions } = options;
  ast = await transformAST(
    cloneAST(ast),
    context,
    figures ? [
      convertFigures({...(options.convert || {}), html: output.html})
    ] : []
  );
  return outputAPI(ast, context, apiOptions);
}

export async function outputAPI(ast, context, options) {
  const { inputFile, outputDir, tempDir } = context;
  const {
    jsFile = `${path.parse(inputFile).name}.mjs`,
    ...rollupOptions
  } = options;

  // set up path variables
  const outputPath = path.join(outputDir, jsFile);
  const entryPath = path.join(tempDir, 'entry-api.js');
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
  script.push(`import { ArticleAPI } from '@living-papers/article-api';`);
  script.push(`export default new ArticleAPI(${JSON.stringify(ast)});`);
  return script.join('\n');
}
