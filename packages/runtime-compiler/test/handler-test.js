import assert from 'node:assert';
import { handler } from '../src/index.js';

describe('handler', () => {
  it('compiles assignment statement', () => {
    assert.deepStrictEqual(
      handler('x = 5', 1),
      {
        viewof: false,
        mutable: false,
        name: '__event1__',
        inputs: [],
        fnargs: [],
        body: 'return([\n' +
          '__proxy__ => {return(\n' +
          '(event) => {__proxy__.x = 5}\n' +
          ')},\n' +
          '["x"]\n' +
          '])',
        async: false,
        generator: false
      }
    );
  });

  it('compiles multiple assignment statement', () => {
    assert.deepStrictEqual(
      handler('x = 5; y = z % 4', 1),
      {
        viewof: false,
        mutable: false,
        name: '__event1__',
        inputs: [ 'z' ],
        fnargs: [ 'z' ],
        body: 'return([\n' +
          '__proxy__ => {return(\n' +
          '(event) => {__proxy__.x = 5; __proxy__.y = z % 4}\n' +
          ')},\n' +
          '["x","y"]\n' +
          '])',
        async: false,
        generator: false
      }
    );
  });
});
