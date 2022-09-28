import chalk from 'chalk';
import chokidar from 'chokidar';
import debounce from 'lodash.debounce';
import { startDevServer } from '@web/dev-server';
import { build } from './build.js';

export async function watch({ inputFile, options }, output) {
  console.log(`\nWatching article ${chalk.cyan(inputFile)}`);

  // for HTML output, launch web server & reload upon changes
  if (output.html) {
    const server = await startDevServer({
      config: {
        rootDir: options.outputDir,
        open: true,
        watch: true,
        clearTerminalOnReload: false
      },
      readCliArgs: false,
      readFileConfig: false,
      logStartMessage: false
    });

    const { hostname, port } = server.config;
    console.log('Launched local web server:');
    console.log(`  ${chalk.cyan(`http://${hostname}:${port}`)}`);
  }

  // watch input file for edits
  chokidar.watch(inputFile)
    .on('change', debounce(() => {
      console.log(chalk.bold(`\nRe-building ${chalk.cyan(inputFile)}`));
      build({ inputFile, options });
    }, 200));
}
