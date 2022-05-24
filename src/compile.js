import fetch from 'node-fetch';
import path from 'node:path';
import { builtins, parseContext, numbered } from './config.js';
import { parseMarkdown } from './parser/parse-markdown.js';
import { cache } from './util/cache.js';

import {
  citations, code, crossref, header, notes, runtime, section
} from './plugins/index.js';
import knitr from './plugins/knitr/index.js';
import pyodide from './plugins/pyodide/index.js';

import outputHTML from './output/html/index.js';
import outputLatex from './output/latex/index.js';

export async function compile(inputFile, options = {}) {
  const startTime = Date.now();

  // Parse Markdown to initial AST
  const { metadata, article } = await parseMarkdown({
    inputFile,
    parseContext: parseContext()
  });

  // Prepare compiler context
  const context = {
    tempDir: path.join(options.outputDir, '.temp'),
    inputDir: path.dirname(inputFile),
    logger: console,
    cache: await cache(),
    fetch,
    components: builtins(),
    ...options,
    metadata,
    inputFile
  };

  // Apply AST transform plugins
  const ast = await transformAST(article, context, [
    ...plugins(metadata.plugins),
    runtime,
    code,
    citations
  ]);

  if (context.debug) {
    console.log('---------------');
    console.log(JSON.stringify(ast, 0, 2));
    console.log('---------------');
  }

  // Marshal output options
  const output = outputOptions(context);

  if (output.latex) {
    await outputLatex(ast, context, output.latex);
  }

  if (output.html) {
    const astHTML = await transformAST(ast, context, [
      crossref(numbered()),
      notes,
      header,
      section
    ]);
    await outputHTML(astHTML, context, output.html);
  }

  return {
    elapsedTime: Date.now() - startTime
  };
}

function plugins(plugins) {
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

async function transformAST(ast, context, plugins) {
  for (const plugin of plugins) {
    ast = await plugin(ast, context);
  }
  return ast;
}

function outputOptions(context) {
  const options = {
    ...context.metadata.output,
    ...context.output
  };
  return Object.keys(options).length ? options : { html: true };
}
