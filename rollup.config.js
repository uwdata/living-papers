// import summary from 'rollup-plugin-summary';
import {terser} from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
// import replace from '@rollup/plugin-replace';
import minifyHTML from 'rollup-plugin-minify-html-literals';

export default {
  input: 'src/index.js', //components/tex-equation.js',
  output: {
    file: 'bundle.js',
    format: 'esm',
    name: 'obs'
  },
  onwarn(warning) {
    if (warning.code !== 'THIS_IS_UNDEFINED') {
      console.error(`(!) ${warning.message}`);
    }
  },
  plugins: [
    // replace({'Reflect.decorate': 'undefined'}),
    resolve(),
    minifyHTML(),
    terser({ecma: 2020, module: true, warnings: true})
    // summary(),
  ],
  preserveEntrySignatures: 'strict'
};
