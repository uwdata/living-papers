import path from 'node:path';
import { builtins, parseContext, numbered } from './config.js';
import { bundle } from './bundle/bundle.js';
import { parseMarkdown } from './parser/parse-markdown.js';
import { citations, crossref, header, notes } from './plugins/index.js';

async function transformAST(ast, plugins, context) {
  for (const plugin of plugins) {
    ast = await plugin(ast, context);
  }
  return ast;
}

export async function compile(inputFile, options = {}) {
  // Parse Markdown to initial AST
  const { metadata, article } = await parseMarkdown({
    inputFile,
    parseContext: parseContext()
  });

  // Apply AST transformation plugins
  const plugins = [
    crossref(numbered()),
    notes,
    header,
    citations
  ];
  const ast = await transformAST(article, plugins, {
    metadata,
    INPUT_DIR: path.dirname(inputFile)
  });

  if (options.debug) {
    console.log('---------------');
    console.log(JSON.stringify(article, 0, 2));
    console.log('---------------');
  }

  const bundleOptions = {
    components: builtins(),
    ...options
  };

  return bundle(ast, bundleOptions);
}
