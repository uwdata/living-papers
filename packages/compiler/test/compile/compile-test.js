import assert from 'node:assert';
import path from 'node:path';
import { compile } from '../../src/index.js';
import { logger } from '../logger.js';

const DEBUG = false;

async function compileTest(input, expectedCounts = {}) {
  const inputFile = path.join('test/data', input);
  const outputDir = path.join('test-output', path.parse(input).name);
  const ctx = {
    outputDir,
    output: {
      html: {
        checksize: false,
        minify: false
      }
    },
    debug: DEBUG,
    logger: logger()
  };
  await compile(inputFile, ctx);

  // check message counts
  const { msg } = ctx.logger;
  for (const key in expectedCounts) {
    if (msg[key].length !== expectedCounts[key]) {
      console.error(inputFile, msg[key]);
    }
    assert.strictEqual(msg[key].length, expectedCounts[key]);
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

  it('an article with dynamic properties', () => {
    return compileTest('article/properties.md');
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

  it('an article with an acm theme', () => {
    return compileTest('article/acm.md');
  });
});
