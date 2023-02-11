import resolve from '@rollup/plugin-node-resolve';
import bundleSize from 'rollup-plugin-bundle-size';
import terser from '@rollup/plugin-terser';
import { rollup as _rollup } from 'rollup';

function onwarn(warning) {
  if (warning.code !== 'CIRCULAR_DEPENDENCY' &&
      warning.code !== 'UNRESOLVED_IMPORT') {
    console.error(`(!) ${warning.message} (code: ${warning.code})`);
  }
}

const plugins = (checksize, minify) => {
  return [
    resolve(),
    ...(checksize ? [bundleSize()] : []),
    ...(minify ? [
      terser({ ecma: 2020, module: true, warnings: true })
    ]: [])
  ];
}

export function rollup({
  input,
  output,
  checksize = true,
  minify = true
} = {}) {
  return build({
      input,
      onwarn,
      plugins: plugins(checksize, minify),
      preserveEntrySignatures: 'strict'
    },
    { file: output, format: 'esm' }
  );
}

async function build(input, output) {
  let bundle;
  try {
    // create a bundle
    bundle = await _rollup(input);
    // an array of file names this bundle depends on
    // console.log(bundle.watchFiles);
    await bundle.write(output);
  } catch (error) {
    console.error(error);
  }
  if (bundle) {
    await bundle.close();
  }
}
