import path from 'node:path';
import {
  getPropertyValue, hasProperty, removeProperty, setValueProperty, visitNodes
} from '../../ast/index.js';
import { pandoc } from '../../parser/pandoc.js';
import { parsePandocAST } from '../../parser/parse-pandoc-ast.js';
import { copy, mkdirp, writeFile } from '../../util/fs.js';
import { generateChunk, generateRMarkdown, generateRScript } from './codegen.js';
import { rscript } from './rscript.js';

export default async function(ast, context) {
  const { outputDir, tempDir, metadata } = context;
  const knitr = metadata.plugins?.knitr || {};

  // gather R code nodes, generate Rmd chunks
  const rnodes = [];
  const chunks = [];
  visitNodes(ast, (node, parent) => {
    if (isRCode(node)) {
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
  await mkdirp(knitDir);
  await Promise.all([
    writeFile(rmdPath, generateRMarkdown(knitr, chunks)),
    writeFile(rPath, generateRScript())
  ]);
  await rscript('knit.R', ['markdown.Rmd'], { cwd: knitDir });

  // parse knitr output, copy generated images, update AST
  const mdAST = parsePandocAST(await pandoc({ inputFile: mdPath }));
  await mkdirp(path.join(outputDir, 'figure'));
  copyOutput(mdAST.article, knitDir, outputDir);
  updateAST(rnodes, mdAST.article.children);

  return ast;
}

function isRCode(node) {
  if (node.name === 'code-block') {
    const classNames = getPropertyValue(node, 'class');
    const classes = classNames ? classNames.split(/\s+/) : [];
    return classes.indexOf('r') >= 0;
  } else if (node.name === 'code') {
    return node.children[0].value.startsWith('r ');
  }
  return false;
}

function updateAST(rnodes, blocks) {
  // filter generated blocks to remove error messages, etc.
  // const blocks = generated.filter(block => {
  //   if (hasProperty(block, 'label')) {
  //     removeProperty(block, 'label');
  //     return true;
  //   } else {
  //     return block.name !== 'code-block';
  //   }
  // });

  rnodes.forEach(([node, parent], i) => {
    const block = blocks[i];
    if (node.name === 'code-block') {
      if (block.name === 'code-block') {
        // rewrite r node to generated code block
        Object.assign(node, block);
      } else {
        // insert generated children in lieu of r node
        parent.children = parent.children
          .map(n => n === node ? block.children : n)
          .flat();
      }
    } else {
      // rewrite r node to span with generated children
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
      copy(
        path.join(inputDir, src),
        path.join(outputDir, src)
      ).catch(err => console.error(err));
    }
  });
}
