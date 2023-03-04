import path from 'node:path';
import {
  clearProperties, createComponentNode, extractProperties, setProperties, setValueProperty
} from '@living-papers/ast';
import { screenshot } from './screenshot.js';

const ALLOWED_FORMATS = ['pdf', 'png', 'jpg'];
const getAstId = handle => handle.evaluate(el => el.dataset.astId);

export async function convertImage(handle, node, options) {
  const {
    convertDir,
    format = 'pdf',
    inline = true,
    resize = false,
    outputDir,
    outputFilePrefix = 'lpub-convert-',
    page
  } = options;

  if (!ALLOWED_FORMATS.includes(format)) {
    throw new Error('Format must be one of:', JSON.stringify(ALLOWED_FORMATS));
  }

  const id = await getAstId(handle);
  const outputFile = `${outputFilePrefix}${id}.${format}`;
  const outputPath = path.join(outputDir, outputFile);

  if (resize) {
    // strip size attributes to screenshot unaltered image size
    await handle.evaluate(el => {
      el.removeAttribute('width');
      el.removeAttribute('height');
    });
  }

  // generate and store snapshot image
  await screenshot(handle, { format, page, path: outputPath });

  // rewrite AST node
  const img = createComponentNode('image');
  setProperties(img, extractProperties(node, isImageProperty));
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

function isImageProperty(key) {
  return key !== 'src' && key !== 'data-ast-id';
}
