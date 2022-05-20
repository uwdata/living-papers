#! /usr/bin/env node
import path from 'node:path';
import chalk from 'chalk';
import { compile } from '../src/compile.js';

const inputFile = process.argv[2];
const outputDir = process.argv[3] || path.dirname(inputFile);
const debug = false;

const logger = {
  log(...args) {
    console.log(...args);
  },
  debug(...args) {
    console.debug(chalk.cyan(...args));
  },
  info(...args) {
    console.info(...args);
  },
  warn(...args) {
    console.info(chalk.yellow(...args));
  },
  error(...args) {
    console.info(chalk.red(...args));
  }
};

compile(inputFile, { outputDir, logger, debug })
  .then(({ elapsedTime }) => {
    const sec = (elapsedTime / 1000).toFixed(2);
    console.log(`Processed article ${chalk.cyan(inputFile)}: ${chalk.green(`${sec} sec`)}`);
    console.log(`Output to ${chalk.cyan(outputDir)}`);
  });
