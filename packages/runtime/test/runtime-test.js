import assert from 'node:assert';
import { ObservableRuntime } from '../dist/runtime.js';

describe('ObservableRuntime', () => {
  it('has runtime and main module properties', () => {
    const rt = new ObservableRuntime();
    assert.ok(rt.runtime);
    assert.ok(rt.main);
  });
});
