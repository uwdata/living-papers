import { transformAST } from '@living-papers/ast';
import { runtime, citations, code, notes } from '../../plugins/index.js';
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
  const { metadata, article: ast } = await parsePandoc(context);
  context.metadata = metadata; // TODO refactor AST handling

  const article = await transformAST(ast, context, [
    runtime,
    code,
    notes,
    citations
  ]);

  return {
    metadata,
    article
  };
}
