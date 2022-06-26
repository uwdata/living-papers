import puppeteer from 'puppeteer';

let browser;

export async function getBrowser() {
  const onClose = () => browser = null;
  return browser || (browser = await launchBrowser({
    headless: true,
    defaultViewport: { width: 1200, height: 900 }
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

async function pdf(impl, { html, css, path, baseURL }) {
  const page = await impl.newPage();
  await page.setContent(`
    <style>
      ${css ? css : ''}
      @media print {
        body { break-inside: avoid; margin: 0; padding: 0; }
      }
    </style>
    ${baseURL ? `<base href="${baseURL}" />` : ''}
    ${html}`);

  const element = await page.$('body > *');
  const { width, height } = await element.boundingBox();

  await page.pdf({
    path,
    pageRanges: '1',
    width: `${Math.ceil(width)}px`,
    height: `${Math.ceil(height)}px`
  });
  await page.close();
}
