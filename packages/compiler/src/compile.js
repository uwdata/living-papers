import fetch from 'node-fetch';
import path from 'node:path';
import { fileCache } from '@uwdata/file-cache';
import { transformAST } from '@living-papers/ast';

import { numbered, inputOptions, outputOptions } from './config.js';
import parse from './parse/index.js';
import { citations, code, notes, runtime } from './plugins/index.js';
import { nodeResolver } from './resolve/node-resolver.js';
import { resolveComponents } from './resolve/components.js';
import { resolvePlugins } from './resolve/plugins.js';

import * as outputMethods from './output/index.js';

export async function compile(inputFile, options = {}) {
  const startTime = Date.now();
  const inputDir = path.dirname(inputFile);

  // Prepare compiler context
  const context = {
    tempDir: path.join(options.outputDir || '.', '.temp'),
    logger: console,
    cache: await fileCache({ cacheDir: options.cacheDir, defaultTTL: options.cacheTTL }),
    fetch,
    resolve: nodeResolver(),
    numbered: numbered(),
    ...options, // may overwrite earlier keys, this is intentional
    metadata: null,
    inputFile,
    inputDir
  };

  // Parse input to initial AST
  const inputOpt = await inputOptions(context);
  const { metadata, article } = await parse(inputOpt);

  // Update compiler context
  context.metadata = metadata;
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
      context.logger.error(`Unrecognized output type: ${name}`);
    } else if (output[name]) {
      files[name] = await method(ast, context, output[name]);
    }
  }

  return {
    elapsedTime: Date.now() - startTime,
    output: files
  };
}
