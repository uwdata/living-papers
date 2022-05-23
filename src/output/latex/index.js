import mustache from 'mustache';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getChildren, getPropertyValue, hasProperty,
  setValueProperty, visitNodes
} from '../../ast/index.js';
import { copy, mkdirp, readFile, writeFile } from '../../util/fs.js';
import { TexFormat } from './tex-format.js';

async function resolveTemplate(id) {
  // TODO generalize further
  const dir = fileURLToPath(new URL(`../../../latex-templates/${id}/`, import.meta.url));
  const pkg = JSON.parse(await readFile(path.join(dir, 'package.json')));
  pkg.dir = dir;
  return pkg;
}

export default async function(ast, metadata, options) {
  const { inputFile, tempDir } = options;
  const { bibtex, references, output: { latex } } = metadata;

  const articlePath = path.parse(inputFile);
  const articleName = articlePath.name;
  const latexDir = path.join(tempDir, 'latex');
  await mkdirp(latexDir);

  // prepare LaTeX formatter
  const tex = new TexFormat({
    references,
    prefix: new Map([
      ['fig', 'Figure~'],
      ['tbl', 'Table~'],
      ['eqn', 'Equation~'],
      ['sec', '\\S']
    ]),
    classes: new Map([
      ['smallcaps', 'textsc'],
      ['italic', 'textit'],
      ['emph', 'emph'],
      ['bold', 'textbf'],
      ['strong', 'textbf'],
      ['demi', 'textbf'],
      ['underline', 'uline']
    ]),
    places: places(ast)
  });

  // Collect template data
  // TODO: auto-generate metadata properties (author_short)
  const author = metadata.author || [{name: 'Unknown Author'}];
  const title = tex.tex(metadata.title) || 'Untitled Article';
  const data = {
    date: tex.tex(metadata.date) || getDate(),
    title,
    author,
    author_first: author[0],
    author_rest: author.slice(1),
    author_names: author.map(a => a.name).join(', '),
    title_short: tex.tex(metadata.title_short),
    author_short: tex.tex(metadata.author_short),
    bibtex: bibtex ? `${articleName}.bib` : undefined,
    keywords: metadata.keywords?.join(', '),
    content: tex.tex(ast).trim()
  };

  // Extract special sections: abstract, acknowledgments, teaser
  getChildren(ast).forEach(node => {
    const name = extractAs(node);
    if (name) {
      data[name] = tex.vspace({ name })
        + tex.fragment(node).trim()
        + tex.label(node, 'fig')
    }
  });

  // generate LaTeX content
  const pkg = await resolveTemplate(latex.template || 'article');
  const template = await readFile(path.join(pkg.dir, pkg.template));
  const content = mustache.render(template, data, {}, {
    tags: ['<<', '>>'],
    escape: x => x
  });

  // write output LaTeX files
  return Promise.all([
    writeFile(path.join(latexDir, `${articleName}.tex`), content),
    ...(bibtex ? [
      writeFile(path.join(latexDir, `${articleName}.bib`), tex.string(bibtex))
    ] : []),
    ...(pkg.files || []).map(f => copy(
      path.join(pkg.dir, f),
      path.join(latexDir, path.parse(f).base)
    ))
  ]);
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
  if (name === 'abstract' || name === 'acknowledgments') {
    return name;
  } else if (name === 'figure' && hasProperty(node, 'teaser')) {
    return 'teaser';
  }
}


