import {
  createTextNode, hasClass, setValueProperty, visitNodes
} from '../../ast/index.js';

import { astToHTML } from '../../build/ast-to-html.js';

import puppeteer from 'puppeteer';


export default function(options = {}) {

  return (ast, context) => {

    // TODO - based out a plan transform the AST/html into 
    //         something that is useful
  
    let id = 0;
    visitNodes(ast, node => {
      setValueProperty(node, 'data-ast-id', id++);
    });
  
    console.log(JSON.stringify(ast, null, 2));
  
    const { html } = astToHTML(ast);
  
    // TODO - 
    //      - transform all 
    // 
    // 
    // 
    // 
    
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
  
    await page.setContent(html);
  
    page.on('console', async (msg) => {
      const msgArgs = msg.args();
      for (let i = 0; i < msgArgs.length; ++i) {
        console.log(await msgArgs[i].jsonValue());
      }
    });
    
    await page.evaluate(async () => { 
      console.log(await window.runtime.value('a'));
    });
  
    await page.evaluate(async () => {
      await window.runtime.handlerUnsafe('(a = 10)')();
    });
  
    await page.evaluate(async () => {
      console.log(await window.runtime.value('a'));
    });
    
    const pdf = await page.pdf({ path: 'html.pdf' });
  
    await page.close();
  
  
    visitNodes(ast, node => {
      removeProperty(node, 'data-ast-id');
    });
  
    return ast;
  }
}
