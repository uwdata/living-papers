import path from 'node:path';
import { mkdirp } from '../../util/fs.js';
import { clearProperties, setValueProperty } from '../../ast/index.js';

const ALLOWED_FORMATS = ['pdf', 'png', 'jpg'];
const OUTPUT_PREFIX = 'lpub-convert-';

export default async function(id, node, handle, options) {
  const { baseURL, browser, format = 'pdf', outer = false } = options;
  if (!ALLOWED_FORMATS.includes(format)) {
    throw new Error('Format must be one of:', JSON.stringify(ALLOWED_FORMATS));
  }

  const convertDir = 'convert';
  const outputDir = path.join(options.outputDir, convertDir);
  await mkdirp(outputDir);

  const outputFile = `${OUTPUT_PREFIX}${id}.${format}`;
  const outputPath = path.join(outputDir, outputFile);

  // generate and store snapshot image
  if (format !== 'pdf') {
    await handle.screenshot({ path: outputPath });
  } else {
    await browser.pdf({
      html: await handle.evaluate(outer ? el => el.outerHTML : el => el.innerHTML),
      path: outputPath,
      baseURL
    });
  }

  // rewrite AST node to an image
  node.name = 'image';
  node.children = undefined;
  clearProperties(node);
  setValueProperty(node, 'src', path.join(convertDir, outputFile));
}