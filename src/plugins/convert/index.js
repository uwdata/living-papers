import {
  setValueProperty, visitNodes, removeProperty, getPropertyValue
} from '../../ast/index.js';
import outputHTML from '../../output/html/index.js';

import { getBrowser } from './browser.js';
import { startServer, stopServer } from './file-proxy-server.js';
import convertAttributes from './convert-attributes.js';
import convertImages from './convert-images.js';
import convertComponents from './convert-components.js';

const PROXY_SERVER_PORT = '3002';
const AST_ID_KEY = 'data-ast-id';

export default function({ html = {}, ...options } = {}) {
  const baseURL = `http://localhost:${PROXY_SERVER_PORT}/`;
  const htmlOptions = {
    ...html,
    baseURL,
    selfContained: true,
    htmlFile: null
  };

  return async (ast, context) => {
    const { inputDir, logger } = context;
    await startServer(inputDir, PROXY_SERVER_PORT);

    // add unique ids to all AST nodes
    let idCounter = 0;
    const astMap = new Map;
    visitNodes(ast, node => {
      const id = String(++idCounter);
      astMap.set(id, node);
      setValueProperty(node, AST_ID_KEY, id);

      // hide nodes from latex
      if (getPropertyValue(node, 'hide') === 'latex') {
        setValueProperty(node, 'hide', 'true');
      }
    });

    // load self-contained HTML
    const browser = await getBrowser();
    const page = await browser.page();
    await page.setContent(await outputHTML(ast, context, htmlOptions));

    // enable debugging from the browser in the node console
    page.on('console', async (msg) => {
      const msgArgs = msg.args();
      for (let i = 0; i < msgArgs.length; ++i) {
        logger.debug(await msgArgs[i].jsonValue());
      }
    });

    const convertOptions = { ...options, baseURL, format: 'pdf', browser };

    // convert dynamic attributes
    await convertAttributes(astMap, page, 'tex-math, tex-equation');

    // convert svg images to pdfs
    // `[${AST_ID_KEY}] img[src$=".svg"], img[src$=".svg"][${AST_ID_KEY}]`,
    await convertImages(astMap, page, `img[src$=".svg"][${AST_ID_KEY}]`, convertOptions);

    // convert components
    await convertComponents(astMap, page, 'cell-view', convertOptions);

    await page.close();
    await Promise.all([ stopServer(), browser.close() ]);

    visitNodes(ast, node => removeProperty(node, AST_ID_KEY));
    return ast;
  }
}
