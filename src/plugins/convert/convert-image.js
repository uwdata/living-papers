import path from 'node:path';
import { clearProperties, setValueProperty } from '../../ast/index.js';

const ALLOWED_FORMATS = ['pdf', 'png', 'jpg'];
const getAstId = handle => handle.evaluate(el => el.dataset.astId);

export async function convertImage(handle, node, options) {
  const {
    baseURL,
    browser,
    convertDir,
    css,
    extract = el => el.innerHTML,
    format = 'pdf',
    outputDir,
    outputFilePrefix = 'lpub-convert-'
  } = options;

  if (!ALLOWED_FORMATS.includes(format)) {
    throw new Error('Format must be one of:', JSON.stringify(ALLOWED_FORMATS));
  }

  const id = await getAstId(handle);
  const outputFile = `${outputFilePrefix}${id}.${format}`;
  const outputPath = path.join(outputDir, outputFile);

  // generate and store snapshot image
  if (format !== 'pdf') {
    await handle.screenshot({ path: outputPath });
  } else {
    await browser.pdf({
      baseURL,
      css,
      html: await handle.evaluate(extract),
      path: outputPath
    });
  }

  // rewrite AST node to an image
  node.name = 'image';
  node.children = undefined;
  clearProperties(node);
  setValueProperty(node, 'src', path.join(convertDir, outputFile));
}
