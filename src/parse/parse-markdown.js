import { pandoc } from './pandoc.js';
import { parsePandocAST } from './parse-pandoc-ast.js';
import { preprocess } from './preprocess.js';
import { writeFile } from '../util/fs.js';
import { streamToString } from '../util/inspect.js';

export async function parseMarkdown(options) {
  const {
    inputFile,
    parseContext
  } = options;

  const doc = await pandoc({
    source: 'markdown',
    target: 'json',
    sourceExtensions: ['-implicit_figures'],
    stdin: await preprocess(inputFile)
  });

  // await writeFile(
  //   'preprocessed.md',
  //   await streamToString(await preprocess(inputFile))
  // )

  // await writeFile(
  //   'pandoc.json',
  //   JSON.stringify(doc, null, 2)
  // );

  const { metadata, article } = parsePandocAST(doc, parseContext);

  return {
    metadata,
    article,
    doc
  };
}
