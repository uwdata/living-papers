import {
  setValueProperty, visitNodes, getProperty, setProperties, removeProperty, clearProperties
} from '../../ast/index.js';

import outputHTML from '../../output/html/index.js';

import puppeteer from 'puppeteer';


export default function(options = {}) {

  return async (ast, context) => {

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
    });
  
    // Create self contained HTML
    const html = await outputHTML(ast, context, {
      ...htmlOptions,
      selfContained: true,
      htmlFile: ''
    });
    
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
  
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
    const replaceNodes = new Set();

    for (const action of plan) {
      const { input, output } = action;

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
        
        // TODO - figure out what the correct place is to put these iamges
        await element.screenshot({path: `lpub-static-transform-${astId}.${output}`});
        replaceNodes.add(+astId);
      }
    }

    await page.close();
  
    visitNodes(ast, node => {
      const nodeId = getProperty(node, 'data-ast-id').value;
      if (replaceNodes.has(nodeId)) {
        node.name = 'img';
        node.children = undefined;
        clearProperties(node);
        setProperties(node, {
          src: {
            type: 'value',
            value: `lpub-static-transform-${nodeId}.png`
          }
        });
      }

      removeProperty(node, 'data-ast-id');
    });
  
    return ast;
  }
}
