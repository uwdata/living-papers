import { components } from './components.js';

export function numbered() {
  return ['figure', 'table', 'equation'];
}

export function parseContext() {
  return {
    fence: ['abstract', 'acknowledgments', 'figure', 'table', 'teaser'],
    block: ['bibliography', 'equation', 'math'],
    xref: ['sec', 'fig', 'tbl', 'eqn'],
    env: ['figure', 'table', 'teaser']
  };
}

export async function outputOptions(context) {
  const options = {
    ...context.metadata.output,
    ...context.output
  };

  // include html output by default
  if (Object.keys(options).length === 0) {
    options.html = {};
  }

  // include components for html output
  if (options.html) {
    options.html = {
      ...options.html,
      components: await components(context)
    };
  }
  return options;
}
