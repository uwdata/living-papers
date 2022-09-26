import assert from 'node:assert';
import path from 'node:path';
import { compile } from '../../src/index.js';

const DEBUG = false;

async function compileTest(input, msgcount = {}) {
  // setup logger
  const msg = { log: [], debug: [], info: [], warn: [], error: [] };
  const logger = Object.keys(msg)
    .reduce((obj, key) => (obj[key] = _ => msg[key].push(_), obj), {});

  // compile
  const inputFile = path.join('test/data', input);
  const outputDir = path.join('test/output', path.parse(input).name);
  await compile(inputFile, {
    outputDir,
    output: {
      html: {
        checksize: false,
        minify: false
      }
    },
    debug: DEBUG,
    logger
  });

  // check message counts
  for (const key in msgcount) {
    assert.strictEqual(msg[key].length, msgcount[key]);
  }
}

describe('compile', () => {
  it('an article with basic markdown', () => {
    return compileTest('article/basic.md');
  });

  it('an article with layout features', () => {
    return compileTest('article/layout.md');
  });

  it('an article with input bindings', () => {
    return compileTest('article/binding.md');
  });

  it('an article with citations', () => {
    return compileTest('article/cite.md', { warn: 1 });
  });

  it('an article with custom components', () => {
    return compileTest('article/components.md');
  });

  it('an article with cross-references', () => {
    return compileTest('article/crossref.md', { warn: 3 });
  });

  it('an article with math and equations', () => {
    return compileTest('article/math.md');
  });

  it('an article with tables', () => {
    return compileTest('article/table.md');
  });

  it('an article with observable javascript code', () => {
    return compileTest('article/observable.md');
  });

  it('an article with python code', () => {
    return compileTest('article/pyodide.md');
  });

  it('an article with R code', () => {
    return compileTest('article/knitr.md');
  });

  it('an article with an acm theme', () => {
    return compileTest('article/acm.md');
  });
});
