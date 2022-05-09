import fetch from 'node-fetch';
import path from 'node:path';
import { builtins, parseContext, numbered } from './config.js';
import { bundle } from './bundle/bundle.js';
import { parseMarkdown } from './parser/parse-markdown.js';
import { citations, code, crossref, header, notes } from './plugins/index.js';
import { cache } from './util/cache.js';

export async function compile(inputFile, options = {}) {
  // Parse Markdown to initial AST
  const { metadata, article } = await parseMarkdown({
    inputFile,
    parseContext: parseContext()
  });

  // Apply AST transformation plugins
  const plugins = [
    code,
    crossref(numbered()),
    notes,
    header,
    citations
  ];
  const ast = await transformAST(article, plugins, {
    cache: await cache(),
    fetch,
    metadata,
    inputDir: path.dirname(inputFile),
    logger: options.logger || console
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

  return bundle({ metadata, article: ast }, bundleOptions);
}

async function transformAST(ast, plugins, options) {
  for (const plugin of plugins) {
    ast = await plugin(ast, options);
  }
  return ast;
}
