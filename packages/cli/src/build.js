import chalk from 'chalk';
import { compile } from '@living-papers/compiler';

export async function build({ inputFile, options }) {
  const { elapsedTime, output } = await compile(inputFile, options);

  for (const type in output) {
    [output[type]]
      .flat()
      .filter(x => x)
      .forEach(file => console.log(`Created ${type} output ${chalk.cyan(file)}`));
  }

  const sec = (elapsedTime / 1000).toFixed(2);
  console.log(`Processed article ${chalk.cyan(inputFile)}: ${chalk.green(`${sec} sec`)}`);
  console.log(`Output folder ${chalk.cyan(options.outputDir)}`);
  return output;
}
