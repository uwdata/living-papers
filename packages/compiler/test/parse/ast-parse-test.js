import assert from 'node:assert';
import { URL } from 'node:url';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseAST } from '../../src/parse/ast/index.js';

const DEBUG = false;

function filePath(name) {
  return fileURLToPath(new URL(`../data/${name}`, import.meta.url));
}

async function parseTest(inputFile, astFile, debug = DEBUG) {
  const { doc, ...ast } = await parseAST({
    inputFile: filePath(inputFile)
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

describe('parseAST', () => {
  it('parses basic formatting', async () => {
    await parseTest('ast/basic.ast.json', 'ast/basic.ast.json');
  });

  it('parses input bindings', async () => {
    await parseTest('ast/binding.ast.json', 'ast/binding.ast.json');
  });

  it('parses citations', async () => {
    await parseTest('ast/cite.ast.json', 'ast/cite.ast.json');
  });

  it('parses cross-references', async () => {
    await parseTest('ast/crossref.ast.json', 'ast/crossref.ast.json');
  });

  it('parses html comments', async () => {
    await parseTest('ast/comment.ast.json', 'ast/comment.ast.json');
  });

  it('parses components', async () => {
    await parseTest('ast/components.ast.json', 'ast/components.ast.json');
  });

  it('parses tex-formatted math', async () => {
    await parseTest('ast/math.ast.json', 'ast/math.ast.json');
  });

  it('parses metadata front matter', async () => {
    await parseTest('ast/metadata.ast.json', 'ast/metadata.ast.json');
  });

  it('parses observable javascript code', async () => {
    await parseTest('ast/observable.ast.json', 'ast/observable.ast.json');
  });

  it('parses styled content', async () => {
    await parseTest('ast/styles.ast.json', 'ast/styles.ast.json');
  });

  it('parses tables', async () => {
    await parseTest('ast/table.ast.json', 'ast/table.ast.json');
  });
});
