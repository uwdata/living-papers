import path from 'node:path';
import outputLatex from '../../output/latex/index.js';
import { convert } from '../../plugins/index.js';
import { transformAST } from '../transform-ast.js';
import {
  getPropertyValue, setValueProperty, visitNodes
} from '../../ast/index.js';

export default async function(ast, context, options) {
  const { pdf = true } = options;
  const { tempDir, output, outputDir } = context;
  const latexDir = path.join(pdf ? tempDir : outputDir, 'latex');

  const astLatex = await transformAST(ast, context, [
    rewriteImagePaths,
    convert({
      ...(options.convert || {}),
      html: output.html,
      outputDir: latexDir,
      assertNoConvertNeeded: options['no-convert-needed'],
    })
  ]);

  return outputLatex(astLatex, context, { ...options, latexDir });
}

async function rewriteImagePaths(ast) {
  visitNodes(ast, node => {
    if (node.name === 'image') {
      setValueProperty(node, 'src', '../../' + getPropertyValue(node, 'src'));
    }
  });
  return ast;
}
