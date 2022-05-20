
import fs from 'fs/promises';

export default async function(data = {}, options = {}) {
  const {
    title = 'Living Paper',
    description = 'Living Papers Article',
    favicon,
    css = './styles.css',
    html = '',
    script = './bundle.js'
  } = data;

  const {
    selfContained = false
  } = options;

  let scriptTag = '';
  if (script) {
    scriptTag = selfContained ? `<script type="module">${await fs.readFile(script)}</script>` : `<script type="module" src="${script}"></script>`;
  }

  let cssTag = '';
  if (css) {
    cssTag = selfContained ? `<style>${await fs.readFile(css)}</style>` : `<link rel="stylesheet" href="${css}" />`;
  }

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
    ${cssTag}
  </head>
  <body>
    ${html}
    ${scriptTag}
  </body>
</html>`;
}
