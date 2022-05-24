export default function(data = {}) {
  const {
    title = 'Untitled Article',
    description = title,
    favicon,
    selfContained = false,
    css = './styles.css',
    html = '',
    script = './bundle.js',
    lang = 'en',
    dir = 'ltr'
  } = data;

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0"/>
    <meta charset="utf-8" />${ favicon
      ? `<link rel="shortcut icon" type="image/x-icon" href="${favicon}" />`
      : '' }
    <title>${title}</title>
    <meta property="og:title" content="${title}" />
    <meta property="og:type" content="article" />
    <meta property="og:description" content="${description}" />
    <meta property="description" content="${description}" />
    ${ selfContained
      ? `<style>\n${css}\n    </style>`
      : `<link rel="stylesheet" href="${css}" />` }
  </head>
  <body>
    ${html}${ script
      ? '`\n    <script type="module"' + (selfContained
        ? `>\n${script}\n    </script>`
        : `src="${script}"></script>`)
      : '' }
  </body>
</html>`;
}
