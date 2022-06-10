import {
  setValueProperty, visitNodes, getProperty, setProperties, removeProperty, clearProperties, hasProperty, setProperty
} from '../../ast/index.js';

import outputHTML from '../../output/html/index.js';

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { startServer, stopServer } from './file-proxy-server.js';

const ALLOWED_OUTPUTS = ['pdf', 'png', 'jpg'];
const PROXY_SERVER_PORT = '3002';

let browser;

const getBrowser = async () => {
  if (!browser) {
    // flags needed for pdf generation
    browser = await puppeteer.launch({ headless: true });
  }
  return browser;
}

const shutDownBrowser = async () => {
  await browser.close();
  browser = null;
}

const htmlToPdf = async ({ html, outputPath, width, height }) => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  // Additional styles to avoid the generated PDF
  // breaking onto multiple pages. 
  await page.setContent(`
    <style>
      @media print {
        *, img, svg {
          break-inside: avoid;
          margin: 0;
          padding: 0;
        }
      }
    </style>
    ${html}`
  );
  await page.pdf({ path: outputPath, width, height });
  await page.close();
}

export default function(options = {}) {

  return async (ast, context) => {
    let { outputDir, inputDir } = context;

    const generatedOutputDir = path.join(outputDir, 'generated-figures');
    if (!existsSync(generatedOutputDir)) {
      await fs.mkdir(generatedOutputDir);
    }

    await startServer(inputDir, PROXY_SERVER_PORT);
    

    const {
      plan = [],
      htmlOptions = {}
    } = options;

    if (!plan.length) {
      console.warn('Running puppeteer with no transformation plan.');
      return ast;
    }
  
    let id = 0;
    visitNodes(ast, node => {
      setValueProperty(node, 'data-ast-id', id++);
      if (hasProperty(node, 'src')) {
        setProperty(node, 'original_src', getProperty(node, 'src'))
        setProperty(node, 'src', {
          type: 'value',
          value: `http://localhost:${PROXY_SERVER_PORT}/${getProperty(node, 'src').value}`
        })
      }
    });
  
    // Create self contained HTML
    const html = await outputHTML(ast, context, {
      ...htmlOptions,
      selfContained: true,
      htmlFile: ''
    });
    
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(html);

    // Enable debugging from the browser in the node console
    page.on('console', async (msg) => {
      const msgArgs = msg.args();
      for (let i = 0; i < msgArgs.length; ++i) {
        console.log(await msgArgs[i].jsonValue());
      }
    });

    // Make sure that the runtime has initialized
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
      const targets = await page.$$(`[data-ast-id] ${input}, ${input}[data-ast-id]`);

      // Create a screenshot for each matching element and store the 
      // corresponding AST id. 
      const getAstId = async (el) => {
        return await page.evaluate(
          e => e.dataset.astId,
          el,
        );
      }

      for (const element of targets) {
        let astNode = element;
        while ((await getAstId(astNode)) === undefined) {
          astNode = await astNode.getProperty('parentNode');
        }
  
        const astId = await getAstId(astNode);
        const outputFilePath = path.join(generatedOutputDir, `lpub-static-transform-${astId}.${output}`);
        
        if (output !== 'pdf') {
          await element.screenshot({ path: outputFilePath });
        } else {
          const { width, height } = await element.boundingBox();
          const innerHtml = await page.evaluate(el => el.outerHTML, element); 
          
          await htmlToPdf({
            html: innerHtml,
            outputPath: outputFilePath, 
            width, 
            height
          });
        }
        replaceNodes.add(+astId);
      }

      visitNodes(ast, node => {
        const nodeId = getProperty(node, 'data-ast-id').value;
        
        // Cleanup src mangling
        if (hasProperty(node, 'original_src')) {
          setProperty(node, 'src', getProperty(node, 'original_src'));
        }

        // Replace the nodes where relevant
        if (replaceNodes.has(nodeId)) {
          const outputFilePath = path.join(generatedOutputDir, `lpub-static-transform-${nodeId}.${output}`);
          node.name = 'img';
          node.children = undefined;
          clearProperties(node);
          setProperties(node, {
            src: {
              type: 'value',
              value: outputFilePath
            }
          });
        }
      });
    }

    await page.close();
    await stopServer();
    await shutDownBrowser();

    visitNodes(ast, node => {
      removeProperty(node, 'data-ast-id');
    });

    return ast;
  }
}
