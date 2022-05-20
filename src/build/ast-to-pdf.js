

import puppeteer from 'puppeteer';

export async function astToPDF(ast, html) {

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.setContent(html);

  page.on('console', async (msg) => {
    const msgArgs = msg.args();
    for (let i = 0; i < msgArgs.length; ++i) {
      console.log(await msgArgs[i].jsonValue());
    }
  });
  
  // Hack to wait for the runtime to initialize
  await page.waitForTimeout(1000);

  await page.evaluate(async () => { 
    console.log(await window.runtime.value('a'));
  });

  await page.evaluate(async () => {
    await window.runtime.handlerUnsafe('(a = 10)')()
  });
  await page.evaluate(async () => {
    console.log(await window.runtime.value('a'));
  });
  
  const pdf = await page.pdf({ path: 'html.pdf' });

  await page.close();

  return { pdf: pdf };
}