import { cloneAST, transformAST } from '@living-papers/ast';
import { convert, crossref, header, htmlCode, section, sticky } from '../../transforms/index.js';
import { outputHTML } from './output-html.js';

export default async function(ast, context, options) {
  const { outputDir } = context;
  ast = await transformAST(
    cloneAST(ast),
    context,
    [
      htmlCode,
      section,
      crossref(context.numbered),
      sticky,
      header,
      convert({
        format: 'png',
        svg: false,
        ...(options.convert || {}),
        html: options,
        outputDir
      })
    ]
  );
  return outputHTML(ast, context, {
    htmlFile: 'static.html',
    ...options
  });
}
