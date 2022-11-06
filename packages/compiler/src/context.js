import fetch from 'node-fetch'; // TODO: use built-in fetch?
import path from 'node:path';
import { fileCache } from '@uwdata/file-cache';
import { inferInputType, numbered } from './config.js';
import { nodeResolver } from './resolve/node-resolver.js';

export async function createContext(inputFile, options) {
  const context = {
    tempDir: path.join(options.outputDir || '.', '.temp'),
    logger: console,
    cache: await fileCache({
      cacheDir: options.cacheDir,
      defaultTTL: options.cacheTTL
    }),
    fetch,
    resolve: nodeResolver(),
    numbered: numbered(),
    ...options, // may overwrite earlier keys, this is intentional
    metadata: null,
    inputFile,
    inputDir: path.dirname(inputFile),
  };

  if (!context.inputType) {
    context.inputType = inferInputType(inputFile, context.logger);
  }

  return context;
}
