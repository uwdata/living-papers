import { parseMarkdown as markdown } from './markdown/index.js';
import { parseAST as ast } from './ast/index.js';

const parsers = {
  ast,
  markdown
};

export default async function parse(context) {
  const { inputType, parser } = context;

  // use custom parser if provided, otherwise lookup by type
  const parse = parser || parsers[inputType];

  // parse and return resulting AST
  if (parse) {
    return parse(context);
  } else {
    throw new Error(`Unrecognized parser: ${inputType}`);
  }
}
