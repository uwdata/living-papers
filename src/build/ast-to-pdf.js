

import puppeteer from 'puppeteer';
import { astToHTML } from './ast-to-html.js';

export async function astToPDF(ast, html) {

  console.log('starting to pdf');
  const browser = await puppeteer.launch()
  const page = await browser.newPage()


  await page.setContent(html);

  const pdf = await page.pdf({ path: 'html.pdf' });

  console.log('ending pdf');
  // await page.close();

  return { pdf: pdf };

}