import puppeteer from 'puppeteer';
let browser;

export async function getBrowser() {
  const onClose = () => browser = null;
  return browser || (browser = await launchBrowser({
    headless: false,
    // defaultViewport: { width: 1200, height: 900 }
    defaultViewport: { width: 800, height: 600 }
  }, onClose));
}

async function launchBrowser(options, onClose) {
  const impl = await puppeteer.launch(options);
  return {
    page() {
      return impl.newPage();
    },
    pdf(options) {
      return pdf(impl, options);
    },
    async close() {
      await onClose(impl);
      await impl.close();
    }
  };
}

async function pdf(impl, { page, baseURL, path, element }) {
  // Prepare the page
  await page.emulateMediaType('print');
  if (baseURL) {
    await page.evaluate((baseURL) => {
      let head = document.querySelector('head');
      head.innerHTML += `<base id="lp-base-url" href="${baseURL}" />`;
   }, baseURL);
  }

  // Take the screenshot
  const { width, height } = await element.boundingBox();
  await page.pdf({
    path,
    pageRanges: '1',
    width: `${Math.ceil(width)}px`,
    height: `${Math.ceil(height)}px`
  });

  // Cleanup
  await page.emulateMediaType('screen');
  await page.evaluate(() => {
    let baseUrlNode = document.querySelector('#lp-base-url');
    baseUrlNode.remove();
  });
}
