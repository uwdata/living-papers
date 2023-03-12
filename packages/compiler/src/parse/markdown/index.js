import { transformAST } from '@living-papers/ast';
import { include, runtime, citations, notes } from '../../transforms/index.js';
import { pandoc } from './pandoc.js';
import { parsePandocAST } from './parse-pandoc-ast.js';
import { preprocess } from './preprocess.js';

function defaultParseContext() {
  return {
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

export async function parsePandoc(options) {
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

  return parsePandocAST(doc, parseContext);
}

export async function parseMarkdown(context) {
  return transformAST(
    await parsePandoc(context),
    context,
    [
      include,
      runtime,
      notes,
      citations
    ]
  );
}
