import assert from 'node:assert';
import { URL } from 'node:url';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { include } from '../../src/plugins/index.js';
import { createContext } from '../../src/context.js';
import { logger } from '../logger.js';

function filePath(name) {
  return fileURLToPath(new URL(`../data/${name}`, import.meta.url));
}

describe('include', () => {
  it('merges included content', async () => {
    const ctx = await createContext(filePath('article/include.md'), { logger: logger() });
    const ast = JSON.parse(await readFile(filePath('ast/include.ast.json')));
    const expect = await readFile(filePath('ast/include-merged.ast.json'), 'utf8');
    const actual = await include(ast, ctx);
    assert.strictEqual(ctx.logger.msg.warn.length, 1);
    assert.deepStrictEqual(JSON.stringify(actual, 0, 2), expect);
  });
});
