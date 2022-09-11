import path from 'node:path';
import { mkdirp } from '../../util/fs.js';

import {
  getPropertyValue, hasExpressionProperty, isCustomComponentNode,
  setValueProperty, visitNodes
} from '../../ast/index.js';

import outputHTML from '../../output/html/index.js';

import { getBrowser } from './browser.js';
import { startServer, stopServer } from './file-proxy-server.js';
import { convertImage } from './convert-image.js';
import { convertComponent } from './convert-component.js';
import { convertProperties } from './convert-properties.js';

const AST_ID_KEY = 'data-ast-id';

export default function({
  html = {},
  delay = 0,
  convertDir = 'convert',
  format = 'pdf',
  outputDir,
  assertNoConvertNeeded = false,
} = {}) {
  return async (ast, context) => {
    const { inputDir, logger } = context;
    const { nodes, prop, svg, custom } = buildConversionPlan(ast);

    // exit early if no conversion is needed
    if (nodes.size === 0) {
      return ast;
    }
    if (assertNoConvertNeeded) {
      throw new Error(`${nodes.size} nodes need conversion, but assertNoConvertNeeded is true`);
    }

    logger.debug('Convert: map dynamic content to static output');

    // launch puppeteer and proxy server
    const [browser, port] = await Promise.all([
      getBrowser(),
      startServer(inputDir)
    ]);

    // prepare html options
    const baseURL = `http://localhost:${port}/`;
    const htmlOptions = {
      ...html,
      baseURL,
      selfContained: true,
      htmlFile: null
    };

    // load self-contained HTML
    const page = await browser.page();
    await page.emulateMediaType('print');
    await page.setContent(await outputHTML(ast, context, htmlOptions));
    if (+delay) {
      logger.debug(`Convert: waiting ${+delay} ms for article load`);
      await page.waitForTimeout(+delay);
    }

    // enable debugging from the browser in the node console
    page.on('console', async (msg) => {
      const msgArgs = msg.args();
      for (let i = 0; i < msgArgs.length; ++i) {
        logger.debug(await msgArgs[i].jsonValue());
      }
    });

    const get = id => page.$(`[${AST_ID_KEY}="${id}"]`);
    const convertOptions = {
      convertDir,
      page,
      format,
      outputDir: path.join(outputDir, convertDir)
    };

    // convert dynamic properties
    for (const id of prop) {
      const node = nodes.get(id);
      await convertProperties(await get(id), node);
      if (isSVGImageNode(node)) {
        svg.add(id); // svg may have been determined dynamically
      }
    }

    // ensure output directory exists
    if (svg.size || custom.size) {
      await mkdirp(convertOptions.outputDir);
    }

    // convert svg images
    const imageOptions = {
      ...convertOptions,
      extract: el => el.outerHTML
    };
    for (const id of svg) {
      await convertImage(await get(id), nodes.get(id), imageOptions);
    }

    // convert custom components
    for (const id of custom) {
      await convertComponent(await get(id), nodes.get(id), convertOptions);
    }

    // shutdown proxy server and puppeteer
    await page.close();
    await Promise.all([
      stopServer(),
      browser.close()
    ]);

    return ast;
  }
}

function buildConversionPlan(ast) {
  const nodes = new Map;
  const prop = new Set;
  const svg = new Set;
  const custom = new Set;
  let _id = 0;

  function add(node, list) {
    let id = getPropertyValue(node, AST_ID_KEY);
    if (id == null) {
      id = String(++_id);
      setValueProperty(node, AST_ID_KEY, id);
      nodes.set(id, node);
    }
    list.add(id);
  }

  visitNodes(ast, node => {
    // hide node from conversion?
    const hide = getPropertyValue(node, 'hide');
    if (hide === 'static' || hide === 'true') {
      setValueProperty(node, 'hide', 'true');
      return;
    }

    const isCustom = isCustomComponentNode(node);

    if (!isCustom && hasExpressionProperty(node)) {
      add(node, prop);
    }

    if (isSVGImageNode(node)) {
      add(node, svg);
    } else if (isCustom) {
      add(node, custom);
    }
  });

  return { nodes, prop, svg, custom };
}

function isSVGImageNode(node) {
  if (node.name === 'image') {
    const src = getPropertyValue(node, 'src') || '';
    return src.endsWith('.svg') || src.startsWith('data:image/svg+xml;');
  }
  return false;
}
