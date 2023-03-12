import { transformAST } from '@living-papers/ast';
import { outputOptions } from './config.js';
import { createContext } from './context.js';
import { resolveComponents } from './resolve/components.js';
import { resolveTransforms } from './resolve/transforms.js';
import * as outputMethods from './output/index.js';

export async function compile(inputFile, options = {}) {
  const startTime = Date.now();

  // Prepare compiler context
  const context = await createContext(inputFile, options);

  // Parse input to initial AST
  let ast = await context.parse(inputFile);
  const { metadata } = ast;

  // Update compiler context
  context.components = await resolveComponents(metadata.components, context);

  // Apply AST transform plugins
  const transforms = await resolveTransforms(metadata.transforms, context);
  ast = await transformAST(ast, context, transforms);

  if (context.debug) {
    console.log('---------------');
    console.log(JSON.stringify(ast, 0, 2));
    console.log('---------------');
  }

  // Marshal output options
  const output = context.output = await outputOptions(context, metadata);
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
