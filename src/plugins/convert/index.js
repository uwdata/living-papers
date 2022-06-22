import path from 'node:path';

import {
  setValueProperty, visitNodes, getProperty, getPropertyValue,
  removeProperty, clearProperties, hasProperty, setProperty
} from '../../ast/index.js';
import outputHTML from '../../output/html/index.js';
import { mkdirp } from '../../util/fs.js';

import { getBrowser } from './browser.js';
import { startServer, stopServer } from './file-proxy-server.js';

const ALLOWED_OUTPUTS = ['pdf', 'png', 'jpg'];
const PROXY_SERVER_PORT = '3002';
const OUTPUT_FILENAME_PREFIX = 'lpub-static-transform-';
const AST_ID_KEY = 'data-ast-id';

function proxyURL(src) {
  // TODO: do not proxy absolute URLs
  return `http://localhost:${PROXY_SERVER_PORT}/${src}`;
}

export default function(options = {}) {

  return async (ast, context) => {
    const { inputDir, logger } = context;

    const convertDir = 'convert';
    const outputDir = path.join(options.outputDir, convertDir);
    await mkdirp(outputDir);
    await startServer(inputDir, PROXY_SERVER_PORT);

    const {
      plan = [],
      htmlOptions = {}
    } = options;

    if (!plan.length) {
      logger.warn('Running convert with no transformation plan.');
      return ast;
    }

    let id = 0;
    visitNodes(ast, node => {
      setValueProperty(node, AST_ID_KEY, id++);
      if (hasProperty(node, 'src')) {
        setProperty(node, 'original_src', getProperty(node, 'src'));
        setValueProperty(node, 'src', proxyURL(getPropertyValue(node, 'src')));
      }
    });

    // Create self contained HTML
    const html = await outputHTML(ast, context, {
      ...htmlOptions,
      selfContained: true,
      htmlFile: ''
    });

    const browser = await getBrowser();
    const page = await browser.page();
    await page.setContent(html);

    // Enable debugging from the browser in the node console
    page.on('console', async (msg) => {
      const msgArgs = msg.args();
      for (let i = 0; i < msgArgs.length; ++i) {
        logger.debug(await msgArgs[i].jsonValue());
      }
    });

    // Make sure that the runtime has initialized
    // TODO - Make this wait for a runtime response
    //        instead of sleeping for an arbitrary
    //        duration.
    await page.waitForTimeout(2000);
    // await page.evaluate(async () => {
    //   console.log(await window.runtime.value('a'));
    // });

    // Execute the plan:
    for (const action of plan) {
      const replaceNodes = new Set();
      let { input, output } = action;
      input = input.replace(/\\"/g, "\"");
      output = output.replace(/\\"/g, "\"");

      if (!ALLOWED_OUTPUTS.includes(output)) {
        throw new Error('Output must be one of:', JSON.stringify(ALLOWED_OUTPUTS));
      }

      // Identify all the targets based on the input type
      const targets = await page.$$(`[${AST_ID_KEY}] ${input}, ${input}[${AST_ID_KEY}]`);

      const getAstId = async (el) => {
        return await page.evaluate(
          e => e.dataset.astId,
          el,
        );
      }

      // For each element, create a screenshot and store the
      // corresponding AST id.
      for (const element of targets) {
        let astNode = element;
        while ((await getAstId(astNode)) === undefined) {
          astNode = await astNode.getProperty('parentNode');
        }

        const astId = await getAstId(astNode);
        const outputPath = path.join(outputDir, `${OUTPUT_FILENAME_PREFIX}${astId}.${output}`);

        if (output !== 'pdf') {
          await element.screenshot({ path: outputPath });
        } else {
          await browser.pdf({
            html: await page.evaluate(el => el.outerHTML, element),
            path: outputPath,
          });
        }
        replaceNodes.add(+astId);
      }

      visitNodes(ast, node => {
        const nodeId = getPropertyValue(node, AST_ID_KEY);

        // Cleanup src mangling
        if (hasProperty(node, 'original_src')) {
          setProperty(node, 'src', getProperty(node, 'original_src'));
          removeProperty(node, 'original_src')
        }

        // Replace the nodes where relevant
        if (replaceNodes.has(nodeId)) {
          const outputPath = path.join(convertDir, `${OUTPUT_FILENAME_PREFIX}${nodeId}.${output}`);
          node.name = 'image';
          node.children = undefined;
          clearProperties(node);
          setValueProperty(node, 'src', outputPath);
        }
      });
    }

    await page.close();
    await Promise.all([
      stopServer(),
      browser.close()
    ]);

    visitNodes(ast, node => {
      removeProperty(node, AST_ID_KEY);
    });

    return ast;
  }
}
