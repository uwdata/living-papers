import {
  getChildren, getClasses, getPropertyValue, getPropertyBoolean,
  hasClass, hasProperty, isTextNode
} from '@living-papers/ast';

function repeat(str, n) {
  if (n < 1) return '';
  let s = str;
  while (--n > 0) s += str;
  return s;
}

export class TexFormat {
  constructor(options) {
    this.options = options;
  }

  string(str) {
    const n = str.length;
    const b = [];
    let i = 0;
    let h = 0;
    for (; i < n; ++i) {
      let p;
      const c = str[i];
      switch (c) {
        case '’': p = '\''; break;
        case '”': p = '\'\''; break;
        case '–': p = '--'; break;
        case '—': p = '---'; break;
        case '{':
        case '}':
        case '#':
        case '&':
        case '_':
        case '$':
        case '%': p = `\\${c}`; break;
        case '…': p = '\\ldots{}'; break;
        case '[':
        case ']': p = `{${c}}`; break;
        case '^': p = `\\^{}`; break;
        case '<': p = `\\textless{}`; break;
        case '>': p = `\\textgreater{}`; break;
        case '|': p = `\\textbar{}`; break;
        case '~': p = `\\textasciitilde{}`; break;
        case '\\': p = `\\textbackslash{}`; break;
        case 'Θ': p = '$\\Theta$'; break;
        // TODO: better handle unicode in latex
      }
      if (p) {
        if (i > h) {
          b.push(str.slice(h, i));
        }
        b.push(p);
        h = i + 1;
      }
    }
    if (h === 0) {
      return str;
    } else if (n > h) {
      b.push(str.slice(h, n));
    }
    return b.join('');
  }

  tex(ast) {
    if (ast == null) {
      return undefined;
    } else if (typeof ast === 'string') {
      return this.string(ast);
    } else if (ast.type === 'textnode') {
      return this.string(ast.value);
    }

    switch (ast.name) {
      case 'article':
        return this.fragment(ast);
      case 'h1':
        return this.header(ast, 0);
      case 'h2':
        return this.header(ast, 1);
      case 'h3':
        return this.header(ast, 2);
      case 'p':
      case 'div':
        return this.paragraph(ast);
      case 'hr':
        return this.env('center', '\\rule{0.5\\linewidth}{0.5pt}');
      case 'blockquote':
        return this.env('quote', this.fragment(ast));
      case 'lineblock': // all children have type 'line'
        throw new Error(`Not yet implemented: ${ast.name}`);
      case 'codeblock':
        return this.codeblock(ast);
      case 'table':
        return this.table(ast);
      case 'thead':
        return this.tableHead(ast);
      case 'tbody':
        return this.tableBody(ast);
      case 'tr':
        return this.tableRow(ast);
      case 'th':
      case 'td':
        return this.tableCell(ast);
      case 'ul':
        return this.list(ast, 'itemize');
      case 'ol':
        return this.list(ast, 'enumerate');
      case 'em':
        return this.command(ast, 'emph');
      case 'strong':
        return this.command(ast, 'textbf');
      case 'sub':
        // TODO? also use \texorpdfstring?
        return this.command(ast, 'textsubscript');
      case 'sup':
        // TODO? also use \texorpdfstring?
        return this.command(ast, 'textsuperscript');
      case 's':
        return this.command(ast, 'sout');
      case 'span':
        return this.span(ast);
      case 'link':
        return this.link(ast);
      case 'image':
        return this.image(ast);
      case 'code':
        return this.code(ast);
      case 'quote':
        return this.quoted(ast);
      case 'note':
        return this.command(ast, 'footnote');
      case 'citelist':
        return this.citeList(ast);
      case 'citeref':
        return this.cite(ast);
      case 'crossref':
        return this.ref(ast);
      case 'crosslist':
        return this.fragment(ast);
      case 'math':
        return this.math(ast);
      case 'equation':
        return this.equation(ast);
      case 'figure':
        return hasClass(ast, 'teaser') ? '' : this.figureEnv(ast);
      case 'caption':
        return this.vspace(ast) + this.command(ast, 'caption');
      case 'raw':
        return this.raw(ast);
      case 'abstract':
      case 'acknowledgments':
      case 'appendix':
      case 'bibliography':
      case 'latex:preamble':
      case 'references':
      case 'teaser':
        return '';
      default:
        return `\\textbf{${ast.name}?}\n\n`;
    }
  }

  fragment(ast, sep = '') {
    return typeof ast === 'string'
      ? this.string(ast)
      : getChildren(ast).map(n => this.tex(n)).join(sep);
  }

  textContent(ast) {
    return typeof ast === 'string' ? ast
      : ast.type === 'textnode' ? ast.value
      : getChildren(ast).map(n => this.textContent(n)).join('');
  }

  header(ast, level) {
    const nonum = getPropertyBoolean(ast, 'nonumber') ? '*' : '';
    return `\\${repeat('sub', level)}section${nonum}{${this.fragment(ast)}}`
      + this.label(ast, 'sec')
      + '\n\n';
  }

  label(ast, prefix = '') {
    if (hasProperty(ast, 'id')) {
      return '\n\\label{'
        + (prefix ? `${prefix}:` : '')
        + getPropertyValue(ast, 'id')
        + '}';
    }
    return '';
  }

  paragraph(ast) {
    return this.fragment(ast) + '\n\n';
  }

  listItem(ast) {
    return '\\item ' + this.fragment(ast);
  }

  list(ast, env) {
    return this.env(
      env,
      getChildren(ast).map(n => this.listItem(n)).join('\n')
    );
  }

  env(env, content, params, args) {
    const arg = (params ? `[${params}]` : '') + (args ? `{${args}}` : '');
    return `\\begin{${env}}${arg}\n${content}\n\\end{${env}}\n\n`;
  }

  command(ast, cmd, param) {
    return `\\${cmd}${param ? `{${param}}` : ''}{${this.fragment(ast)}}`;
  }

  size(ast, content) {
    return getClasses(ast)
      .map(cls => this.options.sizes.get(cls))
      .filter(x => x)
      .reduce((s, c) => `{\\${c} ${s}}`, content);
  }

  span(ast) {
    return this.size(ast, getClasses(ast)
      .map(cls => this.options.classes.get(cls))
      .filter(x => x)
      .reduce((s, c) => this.command(s, c), this.fragment(ast)));
  }

  link(ast) {
    const href = getPropertyValue(ast, 'href');
    if (ast.children.length === 1 && isTextNode(ast.children[0])) {
      if (ast.children[0].value === href) {
        return `\\url{${href}}`;
      }
    }
    return href
      ? `\\href{${href}}{${this.fragment(ast)}}`
      : this.fragment(ast);
  }

  image(ast) {
    const src = sanitizeFile(getPropertyValue(ast, 'src'));
    const alt = getPropertyValue(ast, 'alt');
    const arg = getImageParams(ast);
    if (alt) {
      return `\\begin{figure}[h]
  \\centering
  \\includegraphics[${arg}]{${src}}
  \\caption{${alt}}
  \\end{figure}\n`;
    } else {
      return `\\includegraphics[${arg}]{${src}}`;
    }
  }

  quoted(ast) {
    const num = hasClass(ast, 'single') ? 1 : 2;
    return repeat('`', num)
      + this.fragment(ast)
      + repeat('\'', num);
  }

  cite(ast) {
    const key = getPropertyValue(ast, 'key');
    const index = getPropertyValue(ast, 'index');
    const ref = this.options.references[+index - 1];

    let authors = '';
    if (ref && ref.author) {
      const { author } = ref;
      authors = author[0].family;
      if (author.length === 2) {
        authors += ` \\& ${author[1].family}`;
      } else if (author.length > 2) {
        authors += ' et al.';
      }
      authors =`${authors}~`;
    }
    return `${authors}\\cite{${key}}`;
  }

  citeList(ast) {
    // TODO handle prefix/suffix
    const keys = getChildren(ast)
      .filter(n => n.name === 'citeref')
      .map(n => getPropertyValue(n, 'key'));
    return `\\cite{${keys.join(', ')}}`;
  }

  ref(ast) {
    const type = getPropertyValue(ast, 'type');
    const xref = getPropertyValue(ast, 'xref');
    const short = getPropertyValue(ast, 'short');
    const prefix = (!short && this.options.prefix.get(type)) || '';
    return `${prefix}\\ref{${type}:${xref}}`;
  }

  math(ast) {
    // TODO throw error if interpolated?
    const mode = getPropertyValue(ast, 'mode');
    const displayMode = mode === 'display' || mode == null;
    const code = getPropertyValue(ast, 'code') ?? ast.children[0].value;
    return displayMode ? `\\[${code}\\]` : `$${code}$`;
  }

  equation(ast) {
    // TODO throw error if interpolated?
    const code = getPropertyValue(ast, 'code') ?? ast.children[0].value;
    const env = getPropertyValue(ast, 'type') || 'align';
    const nonum = getPropertyBoolean(ast, 'nonumber');
    return this.vspace(ast)
      + this.env(env + (nonum ? '*' : ''), code);
  }

  code(ast) {
    const lang = getPropertyValue(ast, 'language');
    const cmd = lang ? 'mintinline' : 'texttt';
    const code = lang ? this.textContent(ast) : ast;
    return this.size(ast, this.command(code, cmd, lang));
  }

  codeblock(ast) {
    const lang = getPropertyValue(ast, 'language');
    const code = this.textContent(ast);
    return this.size(ast, lang
      ? this.env('minted', code, null, lang)
      : this.env('verbatim', code));
  }

  figureEnv(ast) {
    const id = getPropertyValue(ast, 'id');
    return this.options.places.has(id)
      ? '' // figure was re-positioned
      : this._figureEnv(ast);
  }

  _figureEnv(ast) {
    const isTable = hasClass(ast, 'table');
    const name = isTable ? 'table' : 'figure';
    const prefix = isTable ? 'tbl' : 'fig';
    const page = hasClass(ast, 'page');
    const env = name + (page ? '*' : '');
    return this.env(
      env,
      '\\centering\n'
        + this.fragment(ast)
        + this.label(ast, prefix)
        + this.vspace(ast),
      getPropertyValue(ast, 'position') || (page ? 't' : null)
    );
  }

  table(ast) {
    return '\n' + this.env(
      'tabular',
      this.fragment(ast),
      null,
      tableAlignment(ast)
    )
  }

  tableHead(ast) {
    const row = ast.children?.[0];
    return row ? this.tableRow(row) + ' \\\\\n\\hline\n'
      : ''; // no table header
  }

  tableBody(ast) {
    return this.fragment(ast, ' \\\\\n');
  }

  tableRow(ast) {
    return this.fragment(ast, ' & ');
  }

  tableCell(ast) {
    return this.fragment(ast);
  }

  raw(ast) {
    const format = getPropertyValue(ast, 'format');
    if (format !== 'tex') {
      return '';
    } else if (hasProperty(ast, 'place')) {
      const node = this.options.places.get(getPropertyValue(ast, 'place'));
      return node ? this._figureEnv(node) : '';
    } else {
      return ast.children[0].value;
    }
  }

  vspace(ast) {
    const vsp = this.options.vspace.get(ast.name);
    return vsp ? `\\vspace{${vsp}}\n` : '';
  }
}

function getImageParams(ast) {
  const w = getPropertyValue(ast, 'latex:width') ?? getPropertyValue(ast, 'width');
  if (typeof w === 'string') {
    if (w.endsWith('%')) {
      // scale width by given percentage (if under 100%)
      const v = +w.slice(0, -1);
      if (v < 100) return `width=0.${v}\\linewidth`;
    } else {
      // pass custom width setting through as-is
      return `width=${w}`;
    }
  }
  // default image size to current line width
  return 'width=\\linewidth';
}

function tableAlignment(ast) {
  const cells = ast.children?.[0]?.children?.[0]?.children || [];
  return cells.map(cell => {
    const classes = new Set(getClasses(cell));
    return classes.has('right') ? 'r'
      : classes.has('center') ? 'c'
      : 'l';
  }).join('');
}

function sanitizeFile(src) {
  return src
    ? decodeURIComponent(src).replace(/%/g, '\\%')
    : '';
}
