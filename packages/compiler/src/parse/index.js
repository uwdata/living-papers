import { parseMarkdown as markdown } from './markdown/index.js';
import { parseAST as ast } from './ast/index.js';

const parsers = {
  ast,
  markdown
};

export default async function parse(options) {
  const { inputType } = options;
  const parse = parsers[inputType];
  if (parse) {
    return parse(options);
  } else {
    throw new Error(`Unrecognized parser: ${inputType}`);
  }
}
