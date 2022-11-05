import { readFile } from 'node:fs/promises';

export async function parseAST(options) {
  const {
    inputFile
  } = options;

  return JSON.parse(await readFile(inputFile));
}
