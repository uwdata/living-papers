import fetch from 'node-fetch';
import path from 'node:path';
import { builtins, parseContext, numbered } from './config.js';
import { bundle } from './bundle/bundle.js';
import { parseMarkdown } from './parser/parse-markdown.js';
import { citations, code, crossref, header, notes } from './plugins/index.js';
import { cache } from './util/cache.js';

import knitr from './plugins/knitr/index.js';
import pyodide from './plugins/pyodide/index.js';

export async function compile(inputFile, options = {}) {
  const outputDir = options.outputDir;
  const tempDir = options.tempDir || path.join(outputDir, '.temp');

  // Parse Markdown to initial AST
  const { metadata, article } = await parseMarkdown({
    inputFile,
    parseContext: parseContext()
  });

  // Apply AST transformation plugins
  const plugins = [
    ...pluginsPre(metadata.plugins),
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
    outputDir,
    tempDir,
    logger: options.logger || console
  });

  if (options.debug) {
    console.log('---------------');
    console.log(JSON.stringify(article, 0, 2));
    console.log('---------------');
  }

  // Generate bundled output
  const bundleOptions = {
    components: builtins(),
    outputDir,
    tempDir,
    ...options
  };
  return bundle({ metadata, article: ast }, bundleOptions);
}

function pluginsPre(plugins) {
  const list = [];
  for (const key in plugins) {
    if (plugins[key]) {
      list.push(resolvePlugin(key));
    }
  }
  return list;
}

function resolvePlugin(name) {
  // TODO plugin resolution
  if (name === 'knitr') {
    return knitr;
  }
  if (name === 'pyodide') {
    return pyodide;
  }
  throw new Error(`Can not find plugin: ${name}`);
}

async function transformAST(ast, plugins, options) {
  for (const plugin of plugins) {
    ast = await plugin(ast, options);
  }
  return ast;
}
