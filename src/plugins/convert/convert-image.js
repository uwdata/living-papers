import path from 'node:path';
import { clearProperties, createComponentNode, setValueProperty } from '../../ast/index.js';
import { AST_ID_KEY } from './constants.js';

const ALLOWED_FORMATS = ['pdf', 'png', 'jpg'];
const getAstId = handle => handle.evaluate(el => el.dataset.astId);

export async function convertImage(handle, node, options) {
  const {
    baseURL,
    browser,
    page,
    convertDir,
    css,
    extract = el => el.innerHTML,
    format = 'pdf',
    inline = true,
    outputDir,
    outputFilePrefix = 'lpub-convert-'
  } = options;

  if (!ALLOWED_FORMATS.includes(format)) {
    throw new Error('Format must be one of:', JSON.stringify(ALLOWED_FORMATS));
  }

  const id = await getAstId(handle);
  const outputFile = `${outputFilePrefix}${id}.${format}`;
  const outputPath = path.join(outputDir, outputFile);

  // inject the necessary CSS
  const injectedStyleHandle = await page.addStyleTag({
    content: `
      body * {
        display: none;
      }

      body [${AST_ID_KEY}="${id}"] {
        display: inline-block;
        margin: 0px !important;
      }
      
      body [${AST_ID_KEY}="${id}"] * {
        display: initial;
      }

      @media print {
        body { break-inside: avoid; margin: 0; padding: 0; }
      }
    `
  })

  // Reference to the element we're screenshotting
  const element = await page.$(`[${AST_ID_KEY}="${id}"]`);

  // Make it visible (maybe there's a better way...)
  await element.evaluate((el) => {
    let ancestor = el.parentElement;
    while (ancestor) {
      ancestor.style.display = 'block'; // Need to worry about resetting the style if it had display: fixed or something?
      ancestor = ancestor.parentElement;
    }
  })

  // generate and store snapshot image
  if (format === 'pdf') {
    await browser.pdf({
      page,
      baseURL,
      element,
      id,
      path: outputPath
    });
  } else {
    await handle.screenshot({ path: outputPath });
  }

  // remove the injected CSS
  await injectedStyleHandle.evaluate(el => el.remove());

  // delete the visibility changes
  await element.evaluate((el) => {
    let ancestor = el.parentElement;
    while (ancestor) {
      delete ancestor.style.display;
      ancestor = ancestor.parentElement;
    }
  })

  // rewrite AST node
  const img = createComponentNode('image');
  setValueProperty(img, 'src', path.join(convertDir, outputFile));
  clearProperties(node);
  if (inline) {
    // if inline, rewrite the node as an image
    Object.assign(node, img);
    node.children = undefined;
  } else {
    // otherwise, wrap image node in a paragraph
    node.name = 'p';
    node.children = [ img ];
  }
}
