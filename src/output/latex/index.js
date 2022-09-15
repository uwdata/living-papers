import mustache from 'mustache';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getChildren, getPropertyValue, hasClass,
  setValueProperty, visitNodes
} from '../../ast/index.js';
import { copy, mkdirp, readFile, writeFile } from '../../util/fs.js';

import { TexFormat } from './tex-format.js';
import { pdflatex } from './pdflatex.js';

export default async function(ast, context, options) {
  const { citations, metadata, inputDir, inputFile, outputDir, tempDir, logger } = context;
  const {
    template = 'article',
    tags = ['<<', '>>'],
    pdf = true,
    latexDir = path.join(pdf ? tempDir : outputDir, 'latex'),
    vspace = {}
  } = options;

  const articleName = path.parse(inputFile).name;
  const bibtex = citations?.bibtex?.length > 0;

  // create directories
  await Promise.all([
    mkdirp(outputDir),
    mkdirp(latexDir)
  ]);

  // prepare LaTeX formatter
  const tex = new TexFormat({
    references: citations?.references,
    prefix: new Map([
      ['fig', 'Figure~'],
      ['tbl', 'Table~'],
      ['eqn', 'Equation~'],
      ['sec', '\\S']
    ]),
    // TODO sizes, colors?
    classes: new Map([
      ['smallcaps', 'textsc'],
      ['italic', 'textit'],
      ['emph', 'emph'],
      ['bold', 'textbf'],
      ['strong', 'textbf'],
      ['demi', 'textbf'],
      ['underline', 'uline']
    ]),
    places: places(ast),
    vspace: new Map(Object.entries(vspace))
  });

  // Marshal template data
  const author = metadata.author || [{name: 'Unknown Author'}];
  const data = {
    date: tex.tex(metadata.date) || getDate(),
    title: tex.tex(metadata.title) || 'Untitled Article',
    author,
    author_first: author[0],
    author_rest: author.slice(1),
    author_names: author.map(a => a.name).join(', '),
    title_short: tex.tex(metadata.title_short),
    author_short: tex.tex(metadata.author_short),
    bibtex: bibtex ? `${articleName}.bib` : undefined,
    keywords: metadata.keywords?.join(', '),
    preamble: `\\graphicspath{{${path.relative(latexDir, inputDir)}}}\n`,
    content: tex.tex(ast).trim()
  };

  // Extract special sections: abstract, acknowledgments, teaser
  getChildren(ast).forEach(node => {
    const name = extractAs(node);
    if (name) {
      data[name] = tex.vspace({ name })
        + tex.fragment(node).trim()
        + tex.label(node, 'fig');
    }
  });

  // generate LaTeX content
  const pkg = await resolveTemplate(template);
  const tmpl = await readFile(path.join(pkg.dir, pkg.template));
  const content = mustache.render(tmpl, data, {}, { tags, escape: x => x });

  // write output LaTeX files to target directory
  await Promise.all([
    writeFile(
      path.join(latexDir, `${articleName}.tex`),
      content
    ),
    ...(bibtex ? [
      writeFile(
        path.join(latexDir, `${articleName}.bib`),
        tex.string(citations.bibtex.join('\n\n'))
      )
    ] : []),
    ...(pkg.files || []).map(f => copy(
      path.join(pkg.dir, f),
      path.join(latexDir, path.parse(f).base)
    ))
  ]);

  if (pdf) {
    try {
      logger.debug(`Running pdflatex for ${articleName}.tex`);
      await pdflatex(latexDir, articleName, bibtex);
      await copy(
        path.join(latexDir, `${articleName}.pdf`),
        path.join(outputDir, `${articleName}.pdf`)
      );
      return path.join(outputDir, `${articleName}.pdf`);
    } catch (err) {
      logger.error('Compiling latex PDF', err);
    }
  } else {
    return latexDir;
  }
}

async function resolveTemplate(id) {
  // TODO generalize further
  try {
    // try to resolve relative to the current directory
    return await resolveTemplateFromDir(id);
  } catch {
    // resolve with a built-in template
    const dir = fileURLToPath(new URL(`../../../latex-templates/${id}/`, import.meta.url));
    return await resolveTemplateFromDir(dir);
  }
}

async function resolveTemplateFromDir(dir) {
  // const dir = fileURLToPath(new URL(`../../../latex-templates/${id}/`, import.meta.url));
  const pkg = JSON.parse(await readFile(path.join(dir, 'package.json')));
  pkg.dir = dir;
  return pkg;
}

function getDate() {
  return new Intl.DateTimeFormat([], { dateStyle: 'long' }).format(new Date);
}

function places(ast) {
  const places = new Map;

  visitNodes(ast, node => {
    if (node.name !== 'raw' || getPropertyValue(node, 'format') !== 'tex') return;
    const text = node.children[0].value;
    const cmd = '\\place{';
    if (text.startsWith(cmd)) {
      const id = text.slice(cmd.length, text.indexOf('}'));
      setValueProperty(node, 'place', id);
      places.set(id, '');
    }
  });

  if (places.size) {
    visitNodes(ast, node => {
      if (node.name === 'figure') {
        const id = getPropertyValue(node, 'id');
        if (id && places.has(id)) {
          places.set(id, node);
        }
      }
    });
  }

  return places;
}

function extractAs(node) {
  const { name } = node;
  switch (name) {
    case 'abstract':
    case 'acknowledgments':
      return name;
    case 'figure':
      if (hasClass(node, 'teaser'))
        return 'teaser';
  }
}
