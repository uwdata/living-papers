import CleanCSS from 'clean-css';
import mustache from 'mustache';
import path from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import { extractText } from '../../ast/index.js';
import { copy, mkdirp, readFile, writeFile } from '../../util/fs.js';
import { astToHTML } from './ast-to-html.js';
import { astToScript } from './ast-to-script.js';
import { rollup } from './rollup.js';
import defaultTemplate from './template.js';

export default async function(ast, context, options) {
  const { metadata, inputDir, outputDir, tempDir } = context;
  const {
    components,
    selfContained = false,
    htmlFile = 'index.html',
    cssFile = 'bundle.css',
    jsFile = 'bundle.js',
    template = defaultTemplate(),
    theme = 'default',
    baseURL = null,
    lang = 'en',
    dir = 'ltr',
    styles,
    ...rollupOptions
  } = options;

  // set up path variables
  const libDir = fileURLToPath(new URL('../../..', import.meta.url));
  const styleDir = path.join(libDir, 'style');
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
  const { script } = astToScript(ast);
  const { html: content, tags, ...bind } = astToHTML(ast);
  const activeComponents = components.filter(c => tags.has(c.name));
  const entry = entryScript({
    root: 'article',
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

  // if we have javascript code, bundle it with rollup
  if (entry) {
    await rollup({ ...rollupOptions, input: entryPath, output: jsPath });
  }

  // generate output html
  const title = extractText(metadata.title) || undefined;
  const html = mustache.render(template, {
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
  }, {}, { escape: x => x });

  if (!selfContained) {
    copy(jsPath, path.join(outputDir, jsFile));
  }

  // copy all assets in style/assets over
  try {
    await copy(styleAssetsDir, assetsPath);
  } catch (err) { }

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

function entryScript({ root, bind, context, components, runtime }) {
  const src = fileURLToPath(new URL('../..', import.meta.url));
  const script = [];
  const refdata = context.citations?.references;
  const hasRefs = refdata?.length > 0;
  const hasSticky = context.sticky;
  const hasOnload = runtime || hasRefs || hasSticky;

  components.forEach(entry => {
    const spec = entry.default ? entry.import : `{ ${entry.import} }`;
    script.push(`import ${spec} from '${entry.file}';`);
  });

  if (runtime) {
    script.push(`import { ObservableRuntime } from '${src}runtime/runtime.js';
import { hydrate } from '${src}output/html/hydrate.js';
import * as module from './runtime.js';`);
  }
  if (hasRefs) {
    script.push(`import { reference } from '${src}output/html/reference.js';`);
  }
  if (hasSticky) {
    script.push(`import { scrollManager } from '${src}output/html/scroll-manager.js';`);
  }

  components.forEach(entry => {
    script.push(`window.customElements.define('${entry.name}', ${entry.import});`);
  });

  if (hasOnload) {
    script.push(`
window.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('${root}');`);
    if (hasRefs) {
      script.push(`  reference(root, ${JSON.stringify(refdata)});`);
    }
    if (runtime) {
      script.push(`  hydrate(new ObservableRuntime, root, module, ${JSON.stringify(bind)});`);
    }
    if (hasSticky) {
      script.push('  scrollManager(root);');
    }
    script.push(`});`);
  }

  return script.join('\n');
}
