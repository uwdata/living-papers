import {
  createComponentNode,
  createProperties,
  createTextNode,
  hasClass,
  prependChildren,
  setValueProperty,
  visitNodes
} from '../../ast/index.js';
import { splitCodeCells, joinCodeCells } from '../../util/code-cells.js';

export default async function(ast, context) {
  const { metadata } = context;
  const options = {
    lang: 'py',    // language class in AST
    tag: '__py__', // template tag to add to runtime
    ...(metadata.plugins?.pyodide || {})
  };
  const { tag, lang } = options;

  // load pyodide, imports, and py template tag
  prependChildren(ast, createComponentNode(
    'cell-view',
    createProperties({ hide: true }),
    [ createTextNode(init(options)) ]
  ));

  // gather and transform Python code nodes
  visitNodes(ast, node => {
    switch (node.name) {
      case 'code':
        const code = node.children[0].value;
        if (code.startsWith(`${lang} `)) {
          node.name = 'cell-view';
          setValueProperty(node, 'inline', true);
          node.children = [
            createTextNode(`${tag}\`${code.slice(lang.length + 1)}\``)
          ];
        }
        break;

      case 'codeblock':
        if (hasClass(node, lang) && !hasClass(node, 'code')) {
          const code = node.children[0].value;
          node.name = 'cell-view';
          node.children = [
            createTextNode(toPyodideBlock(code, tag))
          ];
        }
        break;
    }
  });

  return ast;
}

function toPyodideBlock(code, tag) {
  const cells = splitCodeCells(code).map(cell => {
    const [id = null, append = false] = extractName(cell) || [];
    return (id ? `${id} = ` : '')
      + tag + '`' + cell + (append ? `\n${id}` : '') + '`';
  });
  return joinCodeCells(cells);
}

function init({ tag, micropip }) {
  const imports = getMicropipImports(micropip);
  return `${tag} = {
  const req = await require("//cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js");
  const pyodide = await req.loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.20.0/full/"
  });
  const py = async (strings, ...expressions) => {
    let globals = {};
    const code = strings.reduce((result, string, index) => {
      if (expressions[index]) {
        const name = \`__pyx__\${index}\`;
        globals[name] = expressions[index];
        return result + string + name;
      }
      return result + string;
    }, '');
    await pyodide.loadPackagesFromImports(code);
    const result = await pyodide.runPythonAsync(code, { globals: pyodide.toPy(globals) });
    return result?.toJs ? result.toJs() : result;
  };
  ${imports ? `await py\`${imports}\`;` : ''}
  return py;
}`;
}

function getMicropipImports(micropip) {
  if (!micropip) return '';
  return 'import micropip' +
    micropip.map(p => `\nawait micropip.install('${p}')`).join('');
}

function extractName(cell) {
  const idx = Math.max(0, cell.trim().lastIndexOf('\n'));
  const line = cell.slice(idx).trim();

  if (line.trim().endsWith(';')) {
    // ignore lines ending with semi-colon
    return;
  }

  if (idx === 0) {
    // if single line, attempt to match import statement
    // TODO: multiple imports
    const match = line.match(/^(?:from\s+(?:[A-Za-z_]\w*)\s+)?import\s+([A-Za-z_](?:\w|\.)*)(?:\s+as\s+([A-Za-z_]\w*))?/);
    if (match) {
      return [match[2] || match[1], true];
    }
  }

  // match assignment
  const match = line.match(/^([A-Za-z_]\w*)(?:$|\s*=)/);
  if (match) {
    return [match[1], match[0].endsWith('=')];
  }
}
