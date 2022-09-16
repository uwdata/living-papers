import { components } from './components.js';

export function numbered() {
  return [
    ['figure', ['figure', 'teaser']],
    ['figure', ['table']],
    ['equation']
  ];
}

export function parseContext() {
  return {
    fence: ['abstract', 'acknowledgments', 'aside', 'figure', 'table', 'teaser'],
    block: ['bibliography', 'equation', 'math', 'latex:preamble'],
    xref: ['sec', 'fig', 'tbl', 'eqn'],
    env: ['figure', 'table', 'teaser']
  };
}

export async function outputOptions(context) {
  const options = { ...context.metadata.output };

  // merge passed-in options with metadata options
  for (const key in context.output) {
    if (options[key]) {
      options[key] = { ...options[key], ...context.output[key] };
    } else {
      options[key] = context.output[key];
    }
  }

  // include html output by default
  if (Object.keys(options).length === 0) {
    options.html = {};
  }

  // include components and numbering rules for html output
  if (options.html) {
    options.html = {
      ...options.html,
      components: await components(context),
      numbered: numbered()
    };
  }

  return options;
}
