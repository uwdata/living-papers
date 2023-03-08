import { outputHTML } from '../../output/html/index.js';
import { getBrowser } from './browser.js';
import { startServer, stopServer } from './file-proxy-server.js';

export async function renderPage(ast, context, {
  html = {},
  delay = 0,
  ...browserOptions
} = {}) {
  const { inputDir, logger } = context;

  // launch puppeteer and proxy server
  const [browser, port] = await Promise.all([
    getBrowser(browserOptions),
    startServer(inputDir)
  ]);

  // prepare html options
  const baseURL = `http://localhost:${port}/`;
  const htmlOptions = {
    ...html,
    baseURL,
    selfContained: true,
    htmlFile: null
  };

  // load self-contained HTML
  const page = await browser.page();
  await page.emulateMediaType('print');
  await page.setContent(await outputHTML(ast, context, htmlOptions));
  if (+delay) {
    logger.debug(`Convert: waiting ${+delay} ms for article load`);
    await page.waitForTimeout(+delay);
  }

  // enable debugging from the browser in the node console
  page.on('console', async (msg) => {
    const msgArgs = msg.args();
    for (let i = 0; i < msgArgs.length; ++i) {
      logger.debug(await msgArgs[i].jsonValue());
    }
  });

  return {
    page,
    close: async () => {
      // shutdown proxy server and puppeteer
      await page.close();
      await Promise.all([
        stopServer(),
        browser.close()
      ]);
    }
  }
}
