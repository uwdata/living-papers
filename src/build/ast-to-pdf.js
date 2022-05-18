

import puppeteer from 'puppeteer';
import { astToHTML } from './ast-to-html';

export async function astToPDF(ast) {

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.setContent(astToHTML(ast));

  await page.pdf({ path: 'html.pdf', format: 'A4' });

}