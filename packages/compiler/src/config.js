import path from 'node:path';

export function numbered() {
  return [
    ['figure', ['figure', 'teaser']],
    ['figure', ['table']],
    ['equation']
  ];
}

export async function inputOptions(context) {
  const { inputFile, inputType, logger, parse = {} } = context;
  return {
    inputFile,
    inputType: inputType || inferInputType(inputFile, logger),
    logger,
    ...parse
  }
}

function inferInputType(inputFile, logger) {
  // later this can be extended to additional input formats
  const ext = path.extname(inputFile);
  if (ext === '.json') {
    return 'ast';
  }
  if (ext !== '.md' && ext !== '.lmd') {
    logger.warn('Unrecognized input type, assuming markdown.');
  }
  return 'markdown';
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
