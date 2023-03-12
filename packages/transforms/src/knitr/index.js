import { cp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  createProperties, hasProperty, getPropertyValue, getPropertyBoolean,
  removeProperty, setValueProperty, visitNodes
} from '@living-papers/ast';

import { generateChunk, generateRMarkdown, generateRScript } from './codegen.js';
import { rscript } from './rscript.js';

const BIND = 'bind';

export default async function(ast, context) {
  const { metadata, article } = ast;
  const { outputDir, tempDir, logger } = context;
  const options = {
    figpath: 'knitr/',
    lang: 'r', // language class in AST
    ...(metadata.transforms?.knitr || {})
  };
  const { figpath, lang } = options;

  // gather R code nodes, generate Rmd chunks
  const rnodes = [];
  const chunks = [];
  visitNodes(article, (node, parent) => {
    if (isRCode(node, lang)) {
      rnodes.push([node, parent]);
      chunks.push(generateChunk(node, chunks.length));
    }
  });

  // exit early if there's nothing to do
  if (rnodes.length === 0) {
    return ast;
  }

  // write R files, call knitr
  const knitDir = path.join(tempDir, 'knitr');
  const rmdPath = path.join(knitDir, 'markdown.Rmd');
  const rPath = path.join(knitDir, 'knit.R');
  const mdPath = path.join(knitDir, 'markdown.md');

  await mkdir(knitDir, { recursive: true });
  await Promise.all([
    writeFile(rmdPath, generateRMarkdown(options, chunks)),
    writeFile(rPath, generateRScript())
  ]);
  await rscript('knit.R', ['markdown.Rmd'], { cwd: knitDir });

  // parse knitr output, copy generated images, update AST
  const mdAST = await context.parse(mdPath);
  await mkdir(path.join(outputDir, figpath), { recursive: true });
  copyOutput(mdAST.article, knitDir, outputDir);
  updateAST(rnodes, mdAST.article.children, lang, logger);

  return ast;
}

function isRCode(node, lang) {
  if (node.name === 'codeblock') {
    return getPropertyValue(node, 'language') === lang;
  } else if (node.name === 'code') {
    return node.children[0].value.startsWith(`${lang} `);
  }
  return false;
}

function updateAST(rnodes, output, lang, logger) {
  // log messages, return output blocks
  const blocks = output.filter(block => {
    if (block.name === 'codeblock') {
      if (hasProperty(block, 'type')) {
        const type = getPropertyValue(block, 'type');
        if (type === 'output') {
          removeProperty(block, 'type');
          return true;
        } else {
          logger[type](`knitr ${type}:\n${block.children[0].value}`);
        }
      }
      return false;
    }
    return true;
  });

  // remove hidden nodes
  const nodes = rnodes.filter(([node, parent]) => {
    const hide = getPropertyBoolean(node, 'hide');
    if (hide) {
      parent.children = parent.children.filter(n => n !== node);
    }
    return !hide;
  });

  // update visible nodes
  nodes.forEach(([node, parent], i) => {
      const block = blocks[i];
      if (node.name === 'codeblock') {
        // we show output, not code, so strip r language class
        removeProperty(node, 'language');

        if (block.name !== 'codeblock') {
          // transfer relevant properties to image nodes
          transferChildProperties(node, block);
        } else if (hasProperty(node, BIND)) {
          // bind the output to a runtime variable
          const alias = getPropertyValue(node, BIND);
          node.name = 'cell-view';
          node.properties = createProperties({ hide: true });
          node.children[0].value = `${alias} = (${block.children[0].value})`;
          return;
        }

        if (block.name !== 'codeblock' && parent.name !== 'article') {
          // output is not a code block and is not top-level
          // extract children from unneeded paragraph container
          parent.children = parent.children
            .map(n => n === node ? block.children : n)
            .flat();
        } else {
          // rewrite r node to generated output block
          Object.assign(node, block);
        }
      } else {
        // rewrite r node to span containing generated children
        node.name = 'span';
        node.children = block.children;
      }
    });
}

function copyOutput(ast, inputDir, outputDir) {
  visitNodes(ast, node => {
    if (node.name === 'image') {
      setValueProperty(node, 'alt', 'Plot generated in R');
      removeProperty(node, 'title');
      const src = getPropertyValue(node, 'src');
      cp(
        path.join(inputDir, src),
        path.join(outputDir, src),
        { recursive: true }
      ).catch(err => console.error(err));
    }
  });
}

function transferChildProperties(node, block) {
  const props = ['width', 'height'];
  props.forEach(key => {
    if (hasProperty(node, key)) {
      const value = getPropertyValue(node, key);
      block.children.forEach(child => {
        if (child.name === 'image') {
          setValueProperty(child, key, value);
        }
      });
    }
  });
}
