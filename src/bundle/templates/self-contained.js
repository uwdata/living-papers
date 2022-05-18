
import fs from 'fs/promises';

export default async function(data = {}) {
  const {
    title = 'Living Paper',
    description = 'Living Papers Article',
    favicon,
    css = './styles.css',
    html = '',
    script = './bundle.js'
  } = data;

  const scriptText = script ? await fs.readFile(script) : '';
  const cssText = script ? await fs.readFile(css) : '';

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0"/>
    <meta charset="utf-8" />${favicon
      ? `<link rel="shortcut icon" type="image/x-icon" href="${favicon}" />` : ''}
    <title>${title}</title>
    <meta property="og:title" content="${title}" />
    <meta property="og:type" content="article" />
    <meta property="og:description" content="${description}" />
    <meta property="description" content="${description}" />
    <style>
      ${cssText}
    </style>
  </head>
  <body>
    ${html}${script
      ? `\n    <script type="module">${scriptText}</script>`
      : ''}
  </body>
</html>`;
}
