import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { logger } from './logger.js';

export function getParams() {
  const args = parseArguments();
  const inputFile = args._[0];
  const output = {};
  const options = {
    tempDir: args.tempDir || undefined,
    outputDir: args.outputDir || '.',
    output,
    logger: logger(),
    debug: args.debug
  };

  if (args['ast']) {
    output.ast = {};
  }

  if (args['no-ast']) {
    output.ast = false;
  }

  if (args['no-html']) {
    output.html = false;
  }

  if (args['no-latex']) {
    output.latex = false;
  }

  return {
    inputFile,
    options,
    watch: args.watch
  };
}


export function parseArguments() {
  const helpText = `Compile a Living Papers article.
  Usage: lpub <options> [article.md]`;

  const args = yargs(hideBin(process.argv))
    .usage(helpText)
    .demand(0);

  args.string('o')
    .alias('o', 'outputDir')
    .default('.')
    .describe('o', 'Directory to write output files');

  args.string('tempDir')
    .describe('tempDir', 'Directory to write temporary files');

  args.boolean('debug')
    .describe('debug', 'Enable debugging output');

  args.boolean('ast')
    .describe('ast', 'Forcibly enable AST output');

  args.boolean('no-ast')
    .describe('no-ast', 'Forcibly disable AST output');

  args.boolean('no-html')
    .describe('no-html', 'Forcibly disable HTML output');

  args.boolean('no-latex')
    .describe('no-latex', 'Forcibly disable LaTeX output');

  args.boolean('watch')
    .describe('watch', 'Watch files and automatically rebuild');

  return args.help().version().argv;
}
