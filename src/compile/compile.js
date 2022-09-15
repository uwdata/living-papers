import fetch from 'node-fetch';
import path from 'node:path';
import { parseContext, outputOptions } from './config.js';
import { parseMarkdown } from '../parse/parse-markdown.js';
import { cache } from '../util/cache.js';

import { citations, code, notes, runtime } from '../plugins/index.js';
import knitr from '../plugins/knitr/index.js';
import pyodide from '../plugins/pyodide/index.js';

import * as outputMethods from './output/index.js';
import { transformAST } from './transform-ast.js';

export async function compile(inputFile, options = {}) {
  const startTime = Date.now();
  const inputDir = path.dirname(inputFile);

  // Parse Markdown to initial AST
  const { metadata, article } = await parseMarkdown({
    inputFile,
    parseContext: parseContext()
  });

  // Prepare compiler context
  const context = {
    tempDir: path.join(options.outputDir, '.temp'),
    logger: console,
    cache: await cache(),
    fetch,
    ...options,
    metadata,
    inputFile,
    inputDir
  };

  // Apply AST transform plugins
  const ast = await transformAST(article, context, [
    ...pluginsFromMetadata(metadata.plugins),
    runtime,
    code,
    notes,
    citations
  ]);

  if (context.debug) {
    console.log('---------------');
    console.log(JSON.stringify(ast, 0, 2));
    console.log('---------------');
  }

  // Marshal output options
  const output = context.output = await outputOptions(context);
  const files = {};

  // Produce output files
  // TODO? gather, then run using Promise.all
  for (const name in output) {
    const method = outputMethods[name];
    if (method == null) {
      logger.error(`Unrecognized output type: ${name}`);
    } else {
      files[name] = await method(ast, context, output[name]);
    }
  }

  return {
    elapsedTime: Date.now() - startTime,
    output: files
  };
}

function pluginsFromMetadata(plugins) {
  const list = [];
  for (const key in plugins) {
    if (plugins[key]) {
      list.push(resolvePlugin(key));
    }
  }
  return list;
}

function resolvePlugin(name) {
  // TODO more sophisticated plugin resolution
  if (name === 'knitr') {
    return knitr;
  }
  if (name === 'pyodide') {
    return pyodide;
  }
  throw new Error(`Can not find plugin: ${name}`);
}
