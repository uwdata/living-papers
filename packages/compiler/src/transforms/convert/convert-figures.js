import { getPropertyValue, setValueProperty, visitNodes } from '@living-papers/ast';
import { renderPage } from './render-page.js';
import { screenshot } from './screenshot.js';

const AST_ID_KEY = 'data-ast-id';

export default function({
  html = {},
  delay = 0,
  format = 'png',
  names = ['figure', 'teaser', 'equation', 'table']
} = {}) {
  return async (ast, context) => {
    const { logger } = context;
    const nameSet = new Set(names);
    const nodes = collectNodes(ast.article, node => nameSet.has(node.name));
    const get = id => page.$(`[${AST_ID_KEY}="${id}"]`);

    // exit early if no conversion is needed
    if (nodes.size === 0) return ast;

    logger.debug('Convert: generate figure environment images');

    // render article page in puppeteer
    const opts = { html, delay, viewport: { deviceScaleFactor: 2, width: 1200, height: 900 } };
    const { page, close } = await renderPage(ast, context, opts);

    // hide captions and equation tags
    const css = `figcaption, .katex .tag { display: none; }`;
    const options = { page, format, css, encoding: 'base64' };

    // annotate nodes with image data urls
    for (const [id, node] of nodes) {
      const data = await screenshot(await get(id), options); // generate image
      const url = `data:image/png;base64,${data}`; // create data url
      setValueProperty(node, 'data-url', url); // update AST node
    }

    // shutdown puppeteer and proxy server
    await close();

    return ast;
  }
}

function collectNodes(article, test) {
  const nodes = new Map;
  let _id = 0;

  function add(node) {
    let id = getPropertyValue(node, AST_ID_KEY);
    if (id == null) {
      id = String(++_id);
      setValueProperty(node, AST_ID_KEY, id);
      nodes.set(id, node);
    }
  }

  visitNodes(article, node => {
    if (test(node)) add(node);
  });

  return nodes;
}
