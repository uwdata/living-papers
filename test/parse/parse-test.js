import assert from 'node:assert';
import { URL } from 'node:url';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseContext } from '../../src/compile/config.js';
import { parseMarkdown } from '../../src/parse/parse-markdown.js';

const DEBUG = false;

function filePath(name) {
  return fileURLToPath(new URL(`../data/${name}`, import.meta.url));
}

async function parseTest(inputFile, astFile, debug = DEBUG) {
  const { doc, ...ast } = await parseMarkdown({
    inputFile: filePath(inputFile),
    parseContext: parseContext()
  });
  const actual = JSON.stringify(ast, 0, 2);

  if (debug) {
    console.log(JSON.stringify(doc, 0, 2));
    console.log(actual);
  }

  if (!debug) {
    const expected = await readFile(filePath(astFile), 'utf8');
    assert.equal(actual, expected);
  }
}

describe('parseMarkdown', () => {
  it('parses basic markdown format', async () => {
    await parseTest('article/basic.md', 'ast/basic.ast.json');
  });

  it('parses input bindings', async () => {
    await parseTest('article/binding.md', 'ast/binding.ast.json');
  });

  it('parses citations', async () => {
    await parseTest('article/cite.md', 'ast/cite.ast.json');
  });

  it('parses cross-references', async () => {
    await parseTest('article/crossref.md', 'ast/crossref.ast.json');
  });

  it('parses html comments', async () => {
    await parseTest('article/comment.md', 'ast/comment.ast.json');
  });

  it('parses components', async () => {
    await parseTest('article/components.md', 'ast/components.ast.json');
  });

  it('parses tex-formatted math', async () => {
    await parseTest('article/math.md', 'ast/math.ast.json');
  });

  it('parses metadata front matter', async () => {
    await parseTest('article/metadata.md', 'ast/metadata.ast.json');
  });

  it('parses observable javascript code', async () => {
    await parseTest('article/observable.md', 'ast/observable.ast.json');
  });

  it('parses python code', async () => {
    await parseTest('article/pyodide.md', 'ast/pyodide.ast.json');
  });

  it('parses knitr R code', async () => {
    await parseTest('article/knitr.md', 'ast/knitr.ast.json');
  });

  it('parses styled content', async () => {
    await parseTest('article/styles.md', 'ast/styles.ast.json');
  });

  it('parses tables', async () => {
    await parseTest('article/table.md', 'ast/table.ast.json');
  });
});
