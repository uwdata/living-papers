import chalk from 'chalk';

export function logger() {
  return {
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
}
