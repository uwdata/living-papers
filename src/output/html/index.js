import CleanCSS from 'clean-css';
import path from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import { extractText } from '../../ast/index.js';
import { mkdirp, readFile, writeFile } from '../../util/fs.js';
import { astToHTML } from './ast-to-html.js';
import { astToScript } from './ast-to-script.js';
import { rollup } from './rollup.js';
import { default as _template } from './template.js';

export default async function(ast, context, options) {
  const { metadata, components, outputDir, tempDir } = context;
  const {
    selfContained = false,
    outputHTML = 'index.html',
    outputCSS = 'styles.css',
    outputJS = 'bundle.js',
    template = _template,
    ...rollupOptions
  } = options;

  // set up path variables
  const libDir = fileURLToPath(new URL('../../..', import.meta.url));
  const styleDir = path.join(libDir, 'style');
  const runtimePath = path.join(tempDir, 'runtime.js');
  const entryPath = path.join(tempDir, 'entry.js');
  const htmlPath = path.join(outputDir, outputHTML);
  const cssPath = path.join(outputDir, outputCSS);
  const jsPath = path.join(outputDir, outputJS);
  const stylePaths = [
    path.join(styleDir, 'layout.css'),
    path.join(styleDir, 'styles.css')
  ];

  // create directories
  await Promise.all([
    mkdirp(outputDir),
    mkdirp(tempDir)
  ]);

  // generate page content
  const { script } = astToScript(ast);
  const { html, tags, ...bind } = astToHTML(ast);
  const entrypoint = entrypointScript({
    root: 'article',
    bind,
    metadata,
    components: components.filter(c => tags.has(c.name)),
    runtime: !!script,
  });

  // write content and css files
  // javascript code is written to temp directory
  const css = await bundleCSS(stylePaths, options.minify);
  await Promise.all([
    writeFile(runtimePath, script),
    writeFile(entryPath, entrypoint),
    writeFile(cssPath, css)
  ]);

  // if we have javascript code, bundle it with rollup
  if (entrypoint) {
    await rollup({ ...rollupOptions, input: entryPath, output: jsPath });
  }

  // write output html
  const title = extractText(metadata.title) || undefined;
  await writeFile(htmlPath, template({
    title,
    description: extractText(metadata.description) || title,
    selfContained,
    html,
    css: selfContained ? css : `./${outputCSS}`,
    script: entrypoint && (
      selfContained ? await readFile(jsPath) : `./${outputJS}`
    )
  }));
}

async function bundleCSS(styles, minify) {
  const files = await Promise.all(styles.map(f => readFile(f)));
  const css = files.join('\n');
  return minify
    ? new CleanCSS({ level: 2 }).minify(css).styles
    : css;
}

function entrypointScript({ root, bind, metadata, components, runtime }) {
  const src = fileURLToPath(new URL('../..', import.meta.url));
  const script = [];
  const refdata = metadata.references;
  const hasRefs = refdata?.length > 0;

  components.forEach(({ exported, path }) => {
    script.push(`import { ${exported} } from '${path}';`);
  });

  if (runtime) {
    script.push(`
import { ObservableRuntime } from '${src}runtime/runtime.js';
import { hydrate } from '${src}output/html/hydrate.js';
import * as module from './runtime.js';`);
  }
  if (hasRefs) {
    script.push(`import { reference } from '${src}output/html/reference.js';`);
  }

  components.forEach(({ name, exported }) => {
    script.push(`window.customElements.define('${name}', ${exported});`);
  });

  if (runtime || hasRefs) {
    script.push(`window.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('${root}');`);
  }
  if (hasRefs) {
    script.push(`  reference(root, ${JSON.stringify(refdata)});`);
  }
  if (runtime) {
    script.push(`  hydrate(new ObservableRuntime, root, module, ${JSON.stringify(bind)});`);
  }
  if (runtime || hasRefs) {
    script.push(`});`);
  }

  return script.join('\n');
}
