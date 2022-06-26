export default function() {
  return `<!DOCTYPE html>
<html lang="{{lang}}" dir="{{dir}}">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0"/>
    <meta charset="utf-8" />
{{#favicon}}
    <link rel="shortcut icon" type="image/x-icon" href="{{.}}" />
{{/favicon}}
{{#baseURL}}
    <base href="{{.}}" />
{{/baseURL}}
{{#title}}
    <title>{{title}}</title>
    <meta property="og:title" content="{{title}}" />
{{/title}}
    <meta property="og:type" content="article" />
{{#description}}
    <meta property="og:description" content="{{description}}" />
    <meta property="description" content="{{description}}" />
{{/description}}
{{#selfContained}}
    <style id="lp-embedded-css">\n{{{css}}}\n    </style>
{{/selfContained}}
{{^selfContained}}
    <link rel="stylesheet" href="{{css}}" />
{{/selfContained}}
  </head>
  <body>
    {{{content}}}
{{#script}}
{{#selfContained}}
    <script type="module">
{{{script}}}
    </script>
{{/selfContained}}
{{^selfContained}}
    <script type="module" src="{{script}}"></script>
{{/selfContained}}
{{/script}}
</html>`;
}
