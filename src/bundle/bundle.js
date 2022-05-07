import CleanCSS from 'clean-css';
import path from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import { mkdirp, readFile, rmrf, writeFile } from '../util/fs.js';
import { astToHTML } from '../build/ast-to-html.js';
import { astToScript } from '../build/ast-to-script.js';
import { rollup } from './rollup.js';
import { default as _template } from './template.js';

export async function bundle(article, options) {
  const { metadata, article: ast } = article;
  const {
    components,
    template = _template,
    outputDir,
    outputHTML = 'index.html',
    outputCSS = 'styles.css',
    outputJS = 'bundle.js',
    ...rollupOptions
  } = options;

  // set up path variables
  const libDir = fileURLToPath(new URL('../..', import.meta.url));
  const styleDir = path.join(libDir, 'style');
  const tempDir = path.join(outputDir, '.temp');
  const runtimePath = path.join(tempDir, 'runtime.js');
  const entryPath = path.join(tempDir, 'entry.js');
  const htmlPath = path.join(outputDir, outputHTML);
  const cssPath = path.join(outputDir, outputCSS);
  const jsPath = path.join(outputDir, outputJS);
  const styles = [
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
  await Promise.all([
    writeFile(htmlPath, template({
      html,
      css: `./${outputCSS}`,
      script: entrypoint && `./${outputJS}`
    })),
    writeFile(runtimePath, script),
    writeFile(entryPath, entrypoint),
    writeFile(cssPath, await css(styles))
  ]);

  // if we have javascript code, bundle it with rollup
  if (entrypoint) {
    await rollup({ ...rollupOptions, input: entryPath, output: jsPath });
  }

  // delete temp directory
  await rmrf(tempDir);
}

async function css(styles) {
  const files = await Promise.all(styles.map(f => readFile(f)));
  const css = new CleanCSS({ level: 2}).minify(files.join('\n'));
  return css.styles;
}

function entrypointScript({ root, bind, metadata, components, runtime }) {
  const src = fileURLToPath(new URL('..', import.meta.url));
  const script = [];
  const refdata = metadata.references;
  const hasRefs = refdata?.length > 0;

  components.forEach(({ exported, path }) => {
    script.push(`import { ${exported} } from '${path}';`);
  });

  if (runtime) {
    script.push(`
import { ObservableRuntime } from '${src}runtime/runtime.js';
import { hydrate } from '${src}build/hydrate.js';
import * as module from './runtime.js';`);
  }
  if (hasRefs) {
    script.push(`import { reference } from '${src}/build/reference.js';`);
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
