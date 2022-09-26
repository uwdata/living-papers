import { pandoc } from './pandoc.js';
import { parsePandocAST } from './parse-pandoc-ast.js';
import { preprocess } from './preprocess.js';

export async function parseMarkdown(options) {
  const {
    inputFile,
    parseContext
  } = options;

  const doc = await pandoc({
    source: 'markdown',
    target: 'json',
    sourceExtensions: ['-implicit_figures'],
    stdin: await preprocess(inputFile)
  });

  const { metadata, article } = parsePandocAST(doc, parseContext);

  return {
    metadata,
    article,
    doc
  };
}
