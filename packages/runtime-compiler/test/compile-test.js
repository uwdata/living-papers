import assert from 'node:assert';
import { compile } from '../src/index.js';

describe('compile', () => {
  it('compiles assignment statement', () => {
    assert.deepStrictEqual(
      compile('x = 5'),
      {
        viewof: false,
        mutable: false,
        name: 'x',
        inputs: [],
        fnargs: [],
        body: 'return(\n5\n)',
        async: false,
        generator: false
      }
    );
  });

  it('compiles statement with dependencies', () => {
    assert.deepStrictEqual(
      compile('x = a + b'),
      {
        viewof: false,
        mutable: false,
        name: 'x',
        inputs: [ 'a', 'b' ],
        fnargs: [ 'a', 'b' ],
        body: 'return(\na + b\n)',
        async: false,
        generator: false
      }
    );
  });

  it('compiles viewof statement', () => {
    assert.deepStrictEqual(
      compile('viewof x = Inputs.range([0, 5])'),
      {
        viewof: true,
        mutable: false,
        name: 'x',
        inputs: [ 'Inputs' ],
        fnargs: [ 'Inputs' ],
        body: 'return(\nInputs.range([0, 5])\n)',
        async: false,
        generator: false
      }
    );
  });

  it('compiles async statement', () => {
    // console.log(compile('viewof x = Inputs.range([0, 5])'));
    assert.deepStrictEqual(
      compile('x = (await foo()).value'),
      {
        viewof: false,
        mutable: false,
        name: 'x',
        inputs: [ 'foo' ],
        fnargs: [ 'foo' ],
        body: 'return(\n(await foo()).value\n)',
        async: true,
        generator: false
      }
    );
  });

  it('compiles mutable declaration statement', () => {
    assert.deepStrictEqual(
      compile('mutable x = 5'),
      {
        viewof: false,
        mutable: true,
        name: 'x',
        inputs: [],
        fnargs: [],
        body: 'return(\n5\n)',
        async: false,
        generator: false
      }
    );
  });

  it('compiles mutable reference statement', () => {
    assert.deepStrictEqual(
      compile('z = mutable x'),
      {
        viewof: false,
        mutable: false,
        name: 'z',
        inputs: [ 'mutable x' ],
        fnargs: [ '$0' ],
        body: 'return(\n$0.value\n)',
        async: false,
        generator: false
      }
    );
  });

  it('compiles generator statement', () => {
    assert.deepStrictEqual(
      compile('yield Math.random()'),
      {
        viewof: false,
        mutable: false,
        name: undefined,
        inputs: [],
        fnargs: [],
        body: 'return(\nyield Math.random()\n)',
        async: false,
        generator: true
      }
    );
  });

  it('compiles import statement', () => {
    assert.deepStrictEqual(
      JSON.parse(JSON.stringify(compile('import { cell } from "@user/notebook"'))),
      {
        import: true,
        body: {
          type: 'ImportDeclaration',
          start: 0,
          end: 37,
          specifiers: [
            {
              type: 'ImportSpecifier',
              start: 9,
              end: 13,
              view: false,
              mutable: false,
              imported: {
                type: 'Identifier',
                start: 9,
                end: 13,
                name: 'cell'
              },
              local: {
                type: 'Identifier',
                start: 9,
                end: 13,
                name: 'cell'
              }
            }
          ],
          source: {
            type: 'Literal',
            start: 21,
            end: 37,
            value: '@user/notebook',
            raw: '"@user/notebook"'
          }
        }
      }
    );
  });
});
