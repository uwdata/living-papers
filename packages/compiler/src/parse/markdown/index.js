import { pandoc } from './pandoc.js';
import { parsePandocAST } from './parse-pandoc-ast.js';
import { preprocess } from './preprocess.js';

function defaultParseContext() {
  return {
    fence: [
      'abstract',
      'acknowledgments',
      'aside',
      'figure',
      'table',
      'teaser'
    ],
    block: [
      'bibliography',
      'equation',
      'math',
      'latex:preamble'
    ],
    xref: [
      'sec',
      'fig',
      'tbl',
      'eqn'
    ],
    env: [
      'figure',
      'table',
      'teaser'
    ]
  };
}

export async function parseMarkdown(options) {
  const {
    inputFile,
    parseContext = defaultParseContext()
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
