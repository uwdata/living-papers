import assert from 'node:assert';
import path from 'node:path';
import { compile } from '../src/compile.js';

const DEBUG = false;

function compileTest(input) {
  const inputFile = path.join('test/data', input);
  const outputDir = path.join('test/output', path.parse(input).name);
  return compile(inputFile, {
    outputDir,
    checksize: false,
    minify: false,
    debug: DEBUG
  });
}

describe('compile', () => {
  it('an article with basic markdown', () => {
    return compileTest('article/basic.md');
  });

  it('an article with input bindings', () => {
    return compileTest('article/binding.md');
  });

  it('an article with citations', () => {
    return compileTest('article/cite.md');
  });

  it('an article with custom components', () => {
    return compileTest('article/components.md');
  });

  it('an article with cross-references', () => {
    return compileTest('article/crossref.md');
  });

  it('an article with math and equations', () => {
    return compileTest('article/math.md');
  });

  it('an article with observable code', () => {
    return compileTest('article/observable.md');
  });
});
