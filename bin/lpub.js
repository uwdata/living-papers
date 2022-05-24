#! /usr/bin/env node
import path from 'node:path';
import chalk from 'chalk';
import { compile } from '../src/compile.js';

const inputFile = process.argv[2];
const outputDir = path.dirname(inputFile);
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
  .then(({ elapsedTime, output }) => {
    for (const type in output) {
      [output[type]].flat().forEach(file => {
        console.log(`Created ${type} output ${chalk.cyan(file)}`);
      });
    }
    const sec = (elapsedTime / 1000).toFixed(2);
    console.log(`Processed article ${chalk.cyan(inputFile)}: ${chalk.green(`${sec} sec`)}`);
  });
