import puppeteer from 'puppeteer';

let browser;

export async function getBrowser() {
  return browser || (browser = await launchBrowser(() => browser = null));
}

async function launchBrowser(onClose) {
  const impl = await puppeteer.launch({ headless: true });
  return {
    page() {
      return impl.newPage();
    },
    pdf(options) {
      return htmlToPDF(impl, options);
    },
    async close() {
      await onClose(impl);
      await impl.close();
    }
  };
}

async function htmlToPDF(impl, { html, outputPath, width, height }) {
  const page = await impl.newPage();

  // Additional styles to avoid the generated PDF
  // breaking onto multiple pages.
  await page.setContent(`
    <style>
      @media print {
        *, img, svg {
          break-inside: avoid;
          margin: 0;
          padding: 0;
        }
      }
    </style>
    ${html}`
  );

  await page.pdf({ path: outputPath, width, height });
  await page.close();
}
