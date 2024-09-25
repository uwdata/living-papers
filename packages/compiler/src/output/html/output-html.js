import CleanCSS from 'clean-css';
import mustache from 'mustache';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractText } from '@living-papers/ast';

import { copy, mkdirp, readFile, writeFile } from '../../util/fs.js';
import { resolveTemplate } from '../../resolve/templates.js';

import { astToHTML } from './ast-to-html.js';
import { astToScript } from './ast-to-script.js';
import { bundleJS } from '../bundler.js';

export async function outputHTML(ast, context, options) {
  const { metadata, article, data } = ast;
  const { components, inputDir, outputDir, tempDir } = context;
  const {
    selfContained = false,
    htmlFile = 'index.html',
    cssFile = 'bundle.css',
    jsFile = 'bundle.js',
    template,
    theme = 'default',
    baseURL = null,
    lang = 'en',
    dir = 'ltr',
    styles,
    ...rollupOptions
  } = options;

  // set up path variables
  const styleDir = fileURLToPath(new URL('../../../style', import.meta.url));
  const runtimePath = path.join(tempDir, 'runtime.js');
  const entryPath = path.join(tempDir, 'entry.js');
  const styleAssetsDir = path.join(styleDir, 'themes', theme, 'assets');
  const assetsPath = path.join(outputDir, 'assets');
  const htmlPath = path.join(outputDir, htmlFile || '');
  const cssPath = path.join(outputDir, cssFile);
  const jsPath = path.join(tempDir, jsFile);

  // create directories
  await Promise.all([
    mkdirp(outputDir),
    mkdirp(tempDir)
  ]);

  // generate page content
  const { script } = astToScript(article);
  const { html: content, tags, ...bind } = astToHTML(article);
  const activeComponents = components.filter(c => tags.has(c.name));
  const entry = entryScript({
    root: 'article',
    data,
    bind,
    context,
    components: activeComponents,
    runtime: !!script,
  });

  // bundle style sheets
  const stylePaths = [
    path.join(styleDir, 'common.css'),
    path.join(styleDir, 'layout.css'),
    ...componentCSSPaths(activeComponents),
    path.join(styleDir, 'themes', theme, 'styles.css'),
    path.join(styleDir, 'span.css'),
    ...userCSSPaths(inputDir, styles)
  ];
  const css = await bundleCSS(stylePaths, rollupOptions.minify);

  // write javascript and css files
  // any javascript code is written to temp directory
  await Promise.all([
    writeFile(runtimePath, script),
    writeFile(entryPath, entry),
    ...(selfContained ? [] : [writeFile(cssPath, css)])
  ]);

  // if we have javascript code, bundle it
  if (entry) {
    await bundleJS({ ...rollupOptions, input: entryPath, output: jsPath });
  }

  // generate output html
  const title = extractText(metadata.title) || undefined;
  const templateData = {
    title: title || 'Untitled Article',
    description: extractText(metadata.description) || title,
    favicon: metadata.favicon,
    selfContained,
    content,
    baseURL,
    lang,
    dir,
    css: selfContained ? css : `./${cssFile}`,
    script: entry && (selfContained ? await readFile(jsPath) : `./${jsFile}`)
  };

  const pkg = await resolveTemplate(template, 'html', context);
  const tmpl = await readFile(path.join(pkg.dir, pkg.template));
  const html = mustache.render(tmpl, templateData, {}, { escape: x => x });

  if (entry && !selfContained) {
    copy(jsPath, path.join(outputDir, jsFile));
  }

  // copy all assets in style/assets over
  try {
    await copy(styleAssetsDir, assetsPath);
  } catch (err) { // eslint-disable-line no-unused-vars
    // not all styles have assets, let this fail silently
  }

  // write html file or return html text
  return htmlFile
    ? (await writeFile(htmlPath, html), htmlPath)
    : html;
}

function componentCSSPaths(components) {
  const set = new Set;
  components.forEach(entry => { if (entry.css) set.add(entry.css); });
  return Array.from(set);
}

function userCSSPaths(inputDir, styles) {
  return (styles ? [styles].flat() : [])
    .map(file => path.join(inputDir, file));
}

async function bundleCSS(styles, minify = true) {
  const css = (
    await Promise.all(styles.map(f => readFile(f)))
  ).join('\n');
  return minify
    ? new CleanCSS({ level: 2 }).minify(css).styles
    : css;
}

function entryScript({ root, data, bind, context, components, runtime }) {
  const script = [];
  const rootNode = `document.querySelector('${root}')`;

  // generate component imports
  components.forEach(entry => {
    const spec = entry.default ? entry.import : `{ ${entry.import} }`;
    const filePath = entry.file.replaceAll('\\', '/'); // escape Windows paths
    script.push(`import ${spec} from '${filePath}';`);
  });

  // generate other imports
  const imports = [
    ...(runtime ? ['ObservableRuntime', 'hydrate'] : []),
    ...(context.sticky ? ['scrollManager'] : [])
  ];
  if (imports.length) {
    script.push(`import { ${imports.join(', ')} } from '@living-papers/runtime';`);
  }
  if (runtime) {
    script.push(`import * as module from './runtime.js';`);
  }

  // set article data
  if (data && Object.keys(data)) {
    script.push(`${rootNode}.__data = ${JSON.stringify(data)};`);
  }

  // register custom component elements
  components.forEach(entry => {
    script.push(`window.customElements.define('${entry.name}', ${entry.import});`);
  });

  // initialize runtime, as needed
  if (runtime || context.sticky) {
    script.push(`window.addEventListener('DOMContentLoaded', () => {`);
    script.push(`  const root = ${rootNode};`);
    if (runtime) {
      script.push(`  hydrate(new ObservableRuntime, root, module, ${JSON.stringify(bind)});`);
    }
    if (context.sticky) {
      script.push('  scrollManager(root);');
    }
    script.push(`});`);
  }

  return script.join('\n');
}
