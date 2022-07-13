import outputHTML from '../../output/html/index.js';
import { crossref, header, section, sticky } from '../../plugins/index.js';
import { transformAST } from '../transform-ast.js';

export default async function(ast, context, options) {
  const astHTML = await transformAST(ast, context, [
    crossref(options.numbered),
    sticky,
    header,
    section
  ]);

  return outputHTML(astHTML, context, options);
}
