import fetch from 'node-fetch';
import path from 'node:path';
import { fileCache } from '@uwdata/file-cache';
import { transformAST } from '@living-papers/ast';

import { parseContext, numbered, outputOptions } from './config.js';
import { parseMarkdown } from './parse/parse-markdown.js';
import { citations, code, notes, runtime } from './plugins/index.js';
import { nodeResolver } from './resolve/node-resolver.js';
import { resolveComponents } from './resolve/components.js';
import { resolvePlugins } from './resolve/plugins.js';


import * as outputMethods from './output/index.js';

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
    cache: await fileCache(),
    fetch,
    resolve: nodeResolver(),
    numbered: numbered(),
    ...options,
    metadata,
    inputFile,
    inputDir
  };
  context.components = await resolveComponents(metadata.components, context);

  // Apply standard AST transform plugins
  const ast = await transformAST(article, context, [
    ...resolvePlugins(metadata.plugins, context),
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
    } else if (output[name]) {
      files[name] = await method(ast, context, output[name]);
    }
  }

  return {
    elapsedTime: Date.now() - startTime,
    output: files
  };
}
