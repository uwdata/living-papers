import { getParams } from './get-params.js';
import { build } from './build.js';
import { watch } from './watch.js';

export async function lpub() {
  const params = getParams();
  const output = await build(params);

  if (params.watch) {
    watch(params, output);
  }
}
