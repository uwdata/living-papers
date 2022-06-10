import {
  setValueProperty, visitNodes, getProperty, setProperties, removeProperty, clearProperties, hasProperty, setProperty
} from '../../ast/index.js';

import outputHTML from '../../output/html/index.js';

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { startServer, stopServer } from './file-proxy-server.js';

let browser;

const getBrowser = async () => {
  if (!browser) {
    // flags needed for pdf generation
    browser = await puppeteer.launch({args: ['--allow-file-access-from-files', '--enable-local-file-accesses'], headless: true });
  }
  return browser;
}

const base64Encode = async (file) => {
  var bitmap = await fs.readFile(file);
  return Buffer.from(bitmap).toString('base64');
}

const pngToPdf = async ({ pngPath, width, height }) => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  const image = 'data:image/png;base64,' + base64Encode(png);
  await page.goto(image, {waitUntil: 'networkidle0'});
  await page.pdf({ path: 'output.pdf', width, height });
}

export default function(options = {}) {

  return async (ast, context) => {

    let { outputDir, inputDir } = context;

    await startServer(inputDir);

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
          value: `http://localhost:3002/${getProperty(node, 'src').value}`
        })
      }
    });
  
    console.log(JSON.stringify(ast, null, 2))
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
      const { input, output } = action;
  
      const outputFileExtension = output === 'pdf' ? 'png' : output;

      // Identify all the targets based on the input type
      const targets = await page.$$(`[data-ast-id] ${input}, ${input}[data-ast-id], [data-ast-id] img[src$=".${input}"], img[src$=".${input}"][data-ast-id]`);

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
        console.log(outputDir);
        const outputFilePath = path.join(outputDir, `lpub-static-transform-${astId}.${outputFileExtension}`);
        
        await element.screenshot({ path: outputFilePath });
        replaceNodes.add(+astId);

        if (output === 'pdf') {
          const { width, height } = element.boundingBox();
          await pngToPdf({
            pngPath: outputFilePath, 
            width, 
            height
          });
        }
      }

      visitNodes(ast, node => {
        const nodeId = getProperty(node, 'data-ast-id').value;
        
        // Cleanup src mangling
        if (hasProperty(node, 'original_src')) {
          setProperty(node, 'src', getProperty(node, 'original_src'));
        }

        // Replace the nodes where relevant
        if (replaceNodes.has(nodeId)) {
          const outputFilePath = path.join(outputDir, `lpub-static-transform-${nodeId}.${outputFileExtension}`);
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

    visitNodes(ast, node => {
      removeProperty(node, 'data-ast-id');
    });
    

    return ast;
  }
}
