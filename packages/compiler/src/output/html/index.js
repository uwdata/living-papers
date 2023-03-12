import { cloneAST, transformAST } from '@living-papers/ast';
import { crossref, header, htmlCode, section, sticky } from '../../transforms/index.js';
import { outputHTML } from './output-html.js';

export default async function(ast, context, options) {
  ast = await transformAST(
    cloneAST(ast),
    context,
    [
      htmlCode,
      section,
      crossref(context.numbered),
      sticky,
      header
    ]
  );
  return outputHTML(ast, context, options);
}
