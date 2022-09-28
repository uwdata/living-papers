import puppeteer from 'puppeteer';

let browser;

export async function getBrowser() {
  const onClose = () => browser = null;
  return browser || (browser = await launchBrowser({
    headless: true,
    defaultViewport: { width: 800, height: 600 }
  }, onClose));
}

async function launchBrowser(options, onClose) {
  const impl = await puppeteer.launch(options);
  return {
    page() {
      return impl.newPage();
    },
    async close() {
      await onClose(impl);
      await impl.close();
    }
  };
}
