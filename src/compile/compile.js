import fetch from 'node-fetch';
import path from 'node:path';
import { parseContext, numbered, outputOptions } from './config.js';
import { parseMarkdown } from '../parse/parse-markdown.js';
import { cache } from '../util/cache.js';

import {
  citations, code, convert, crossref, header, notes, runtime, section, sticky
} from '../plugins/index.js';
import { cloneNode } from '../ast/index.js';
import knitr from '../plugins/knitr/index.js';
import pyodide from '../plugins/pyodide/index.js';

import outputHTML from '../output/html/index.js';
import outputLatex from '../output/latex/index.js';

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
  const output = await outputOptions(context);
  const files = {};

  if (output.html) {
    const astHTML = await transformAST(cloneNode(ast), context, [
      crossref(numbered()),
      notes,
      sticky,
      header,
      section
    ]);
    files.html = await outputHTML(astHTML, context, output.html);
  }

  if (output.latex) {
    // TODO: clean up, de-duplicate output dir determination
    const { convert: plan, pdf = true } = output.latex;
    const outputDir = path.join(pdf ? context.tempDir : context.outputDir, 'latex');
    const astLatex = await transformAST(cloneNode(ast), context, [
      convert({ plan, outputDir, htmlOptions: output.html })
    ]);
    files.latex = await outputLatex(astLatex, context, output.latex);
  }

  return {
    elapsedTime: Date.now() - startTime,
    output: files
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
