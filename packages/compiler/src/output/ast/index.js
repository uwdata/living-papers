import path from 'node:path';
import { mkdirp, writeFile } from '../../util/fs.js';

export default async function(ast, context, options) {
  const { inputFile, outputDir, metadata } = context;
  const {
    astFile = `${path.parse(inputFile).name}.ast.json`,
    space = null
  } = options;

  const outputPath = path.join(outputDir, astFile);
  await mkdirp(path.dirname(outputPath));
  await writeFile(
    outputPath,
    JSON.stringify({ metadata, article: ast }, null, +space || 0)
  );
  return outputPath;
}
