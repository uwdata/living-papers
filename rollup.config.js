import resolve from '@rollup/plugin-node-resolve';
import bundleSize from 'rollup-plugin-bundle-size';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/living-papers.js',
    format: 'esm',
    name: 'obs'
  },
  onwarn(warning) {
    if (warning.code !== 'CIRCULAR_DEPENDENCY') {
      console.error(`(!) ${warning.message}`);
    }
  },
  plugins: [
    resolve(),
    minifyHTML(),
    bundleSize(),
    terser({ ecma: 2020, module: true, warnings: true })
  ],
  preserveEntrySignatures: 'strict'
};
