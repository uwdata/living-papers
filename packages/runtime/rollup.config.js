import { nodeResolve } from '@rollup/plugin-node-resolve';

function onwarn(warning, defaultHandler) {
  if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    defaultHandler(warning);
  }
}

export default [
  {
    input: 'src/index.js',
    plugins: [
      nodeResolve({ modulesOnly: true })
    ],
    onwarn,
    output: [
      {
        file: 'dist/runtime.js',
        format: 'es'
      }
    ]
  }
];