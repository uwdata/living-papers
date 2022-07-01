import puppeteer from 'puppeteer';
let browser;

export async function getBrowser() {
  const onClose = () => browser = null;
  return browser || (browser = await launchBrowser({
    headless: true,
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
  await page.emulateMediaType('print');

  /**
   * This seems to cause an error, so I'm removing it for now.
   * There is likely a better way to set the base URL.
   */
  // if (baseURL) {
  //   await page.evaluate((baseURL) => {
  //     let body = document.querySelector('body');
  //     body.innerHTML += `<base id="lp-base-url" href="${baseURL}" />`;
  //  }, baseURL);
  // }

  const { width, height } = await element.boundingBox();
  await page.pdf({
    path,
    pageRanges: '1',
    width: `${Math.ceil(width)}px`,
    height: `${Math.ceil(height)}px`
  });

  await page.emulateMediaType('screen');

  // See comment above
  //   await page.evaluate(() => {
  //     let baseUrlNode = document.querySelector('#lp-base-url');
  //     baseUrlNode.remove();
  //  });
}
