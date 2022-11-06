import { readFile } from 'node:fs/promises';

export async function parseAST(context) {
  const { inputFile } = context;
  return JSON.parse(await readFile(inputFile));
}
