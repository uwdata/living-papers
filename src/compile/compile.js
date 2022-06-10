import fetch from 'node-fetch';
import path from 'node:path';
import { parseContext, numbered, outputOptions } from './config.js';
import { parseMarkdown } from '../parse/parse-markdown.js';
import { cache } from '../util/cache.js';

import {
  citations, code, crossref, header, notes, runtime, section, puppeteer
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

  const astHTML = await transformAST(ast, context, [
    crossref(numbered()),
    notes,
    header,
    section
  ]);

  // For some reason running outputHTML affects the 
  // AST. So you can't run it twice...
  //          await outputHTML(astHTML, ...)
  //          await outputHTML(astHTML, ...)
  // The puppeteer library needs to generate its own
  // version of the HTML, so we just deep clone the ast
  // here to make it work. 
  let astLatex = cloneNode(astHTML);

  if (output.html) {
    files.html = await outputHTML(astHTML, context, output.html);
  }

  if (output.latex) {
    const plan = output.latex.puppeteer;

    astLatex = await transformAST(astLatex, context, [
      puppeteer({plan, htmlOptions: output.html})
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
