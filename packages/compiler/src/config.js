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
  const { metadata } = context;
  const options = { ...metadata.output };

  // include html output by default
  if (Object.keys(options).length === 0) {
    options.html = {};
  }

  // merge passed-in options with metadata options
  for (const key in context.output) {
    if (options[key]) {
      options[key] = { ...options[key], ...context.output[key] };
    } else {
      options[key] = context.output[key];
    }
  }

  return options;
}
