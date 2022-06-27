import path from 'node:path';
import outputLatex from '../../output/latex/index.js';
import { convert } from '../../plugins/index.js';
import { transformAST } from '../transform-ast.js';

export default async function(ast, context, options) {
  const { pdf = true } = options;
  const { tempDir, output, outputDir } = context;
  const latexDir = path.join(pdf ? tempDir : outputDir, 'latex');

  const astLatex = await transformAST(ast, context, [
    convert({
      ...(options.convert || {}),
      html: output.html,
      outputDir: latexDir
    })
  ]);

  return outputLatex(astLatex, context, { ...options, latexDir });
}
