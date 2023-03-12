import path from 'node:path';
import { mkdirp } from '../../util/fs.js';

import {
  EVENT, isCustomComponentNode, extractProperties,
  getPropertyValue, hasEventProperty, hasExpressionProperty,
  setValueProperty, visitNodes
} from '@living-papers/ast';

import { convertImage } from './convert-image.js';
import { convertComponent } from './convert-component.js';
import { convertProperties } from './convert-properties.js';
import { renderPage } from './render-page.js';

const AST_ID_KEY = 'data-ast-id';

export default function({
  html = {},
  delay = 0,
  viewport,
  convertDir = 'convert',
  format = 'pdf',
  svg = true,
  outputDir,
} = {}) {
  return async (ast, context) => {
    const { logger } = context;
    const { nodes, prop, svgs, custom } = buildConversionPlan(ast.article, { svg });
    const get = id => page.$(`[${AST_ID_KEY}="${id}"]`);

    // exit early if no conversion is needed
    if (nodes.size === 0) return ast;

    logger.debug('Convert: map dynamic content to static output');

    const opts = { html, delay, viewport };
    const { page, close } = await renderPage(ast, context, opts);

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
      if (svg && isSVGImageNode(node)) {
        svgs.add(id); // svg may have been determined dynamically
      }
    }

    // ensure output directory exists
    if (svgs.size || custom.size) {
      await mkdirp(convertOptions.outputDir);
    }

    // convert svg images
    const imageOptions = {
      ...convertOptions,
      resize: true,
      extract: el => el.outerHTML
    };
    for (const id of svgs) {
      await convertImage(await get(id), nodes.get(id), imageOptions);
    }

    // convert custom components
    for (const id of custom) {
      await convertComponent(await get(id), nodes.get(id), convertOptions);
    }

    // shutdown puppeteer and proxy server
    await close()

    return ast;
  }
}

function buildConversionPlan(article, { svg: convertSVG }) {
  const nodes = new Map;
  const prop = new Set;
  const svgs = new Set;
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

  visitNodes(article, node => {
    // remove all event-typed properties
    filterEventProperties(node);

    // hide node from conversion?
    const hide = getPropertyValue(node, 'hide');
    if (hide === 'static' || hide === 'true') {
      setValueProperty(node, 'hide', 'true');
      return;
    }

    const isCustom = isCustomComponentNode(node);

    // convert properties of non-custom component
    // custom components will be replaced separately
    if (!isCustom && hasExpressionProperty(node)) {
      add(node, prop);
    }

    // add nodes to appropriate conversion queues
    if (convertSVG && isSVGImageNode(node)) {
      add(node, svgs);
    } else if (isCustom) {
      add(node, custom);
    }
  });

  return { nodes, prop, svgs, custom };
}

function isSVGImageNode(node) {
  if (node.name === 'image') {
    const src = getPropertyValue(node, 'src') || '';
    return src.endsWith('.svg') || src.startsWith('data:image/svg+xml;');
  }
  return false;
}

function filterEventProperties(node) {
  if (!hasEventProperty(node)) return;
  node.properties = extractProperties(node, (key, prop) => prop.type !== EVENT);
}
