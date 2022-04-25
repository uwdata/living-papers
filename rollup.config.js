import {terser} from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import minifyHTML from 'rollup-plugin-minify-html-literals';

export default {
  input: 'src/index.js', //components/tex-equation.js',
  output: {
    file: 'bundle.js',
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
    terser({ ecma: 2020, module: true, warnings: true })
  ],
  preserveEntrySignatures: 'strict'
};
