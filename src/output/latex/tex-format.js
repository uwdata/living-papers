import {
  getChildren, getClasses, getPropertyValue,
  hasClass, hasProperty, isTextNode
} from '../../ast/index.js';

function repeat(str, n) {
  if (n < 1) return '';
  let s = str;
  while (--n > 0) s += str;
  return s;
}

function bool(value) {
  return String(value).toLowerCase() !== 'false';
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
        case '–': p = '--'; break;
        case '—': p = '---'; break;
        case '&':
        case '_':
        case '^':
        case '%': p = `\\${c}`; break;
      }
      if (p) {
        if (i > h) {
          b.push(str.slice(h, i));
          h = i + 1;
        }
        b.push(p);
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
      case 'table':
      case 'code-block':
        // TODO implement
        throw new Error(`Not yet implemented: ${ast.name}`);
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
        // TODO syntax highlighting
        return this.command(ast, 'texttt');
      case 'quote':
        return this.quoted(ast);
      case 'note':
        return this.command(ast, 'footnote');
      case 'cite-list':
        return this.citeList(ast);
      case 'cite-ref':
        return this.cite(ast);
      case 'cross-ref':
        return this.ref(ast);
      case 'cross-list':
        return this.fragment(ast);
      case 'math':
        return this.math(ast);
      case 'equation':
        return this.equation(ast);
      case 'figure':
        return hasProperty(ast, 'teaser') ? '' : this.figure(ast);
      case 'caption':
        return this.vspace(ast) + this.command(ast, 'caption');
      case 'raw':
        return this.raw(ast);
      case 'bibliography':
      case 'abstract':
      case 'teaser':
      case 'references':
      case 'acknowledgments':
        return '';
      default:
        return `\\textbf{${ast.name}?}\n\n`;
    }
  }

  fragment(ast) {
    return typeof ast === 'string'
      ? this.string(ast)
      : getChildren(ast).map(n => this.tex(n)).join('');
  }

  header(ast, level) {
    // TODO: nonumber?
    return `\\${repeat('sub', level)}section{${this.fragment(ast)}}`
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
    return '\\item ' + this.tex(ast);
  }

  list(ast, env) {
    return this.env(
      env,
      getChildren(ast).map(n => this.listItem(n)).join('\n')
    );
  }

  env(env, content, params) {
    const arg = params ? `[${params}]` : '';
    return `\\begin{${env}}${arg}\n${content}\n\\end{${env}}\n\n`;
  }

  command(ast, cmd) {
    return `\\${cmd}{${this.fragment(ast)}}`;
  }

  span(ast) {
    return getClasses(ast)
      .map(cls => this.options.classes.get(cls))
      .filter(x => x)
      .reduce((s, c) => this.command(s, c), this.fragment(ast));
  }

  link(ast) {
    const href = getPropertyValue(ast, 'href');
    if (ast.children.length === 1 && isTextNode(ast.children[0])) {
      if (ast.children[0].value === href) {
        return `\\url{${href}}`;
      }
    }
    return `\\href{${href}}{${this.fragment(ast)}}`;
  }

  image(ast) {
    // TODO provide svg to pdf conversion
    const img = getPropertyValue(ast, 'src');
    const src = img.endsWith('.svg') ? img.slice(0, -4) + '.pdf' : img;
    const alt = getPropertyValue(ast, 'alt');
    const arg = 'width=\\linewidth';
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
      .filter(n => n.name === 'cite-ref')
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
    const code = getPropertyValue(ast, 'code') || (ast.children && ast.children.length ? ast.children[0].value : '');
    return displayMode ? `\\[${code}\\]` : `$${code}$`;
  }

  equation(ast) {
    // TODO throw error if interpolated?
    const code = getPropertyValue(ast, 'code') || ast.children[0].value;
    const env = getPropertyValue(ast, 'type') || 'align';
    const nonum = bool(getPropertyValue(ast, 'nonumber'));
    return this.vspace(ast)
      + this.env(env + (nonum ? '*' : ''), code);
  }

  figure(ast) {
    const id = getPropertyValue(ast, 'id');
    return this.options.places.has(id)
      ? '' // figure was re-positioned
      : this._figure(ast);
  }

  _figure(ast) {
    const page = hasClass(ast, 'page');
    const env = 'figure' + (page ? '*' : '');
    return this.env(
      env,
      '\\centering\n'
        + this.fragment(ast)
        + this.label(ast, 'fig')
        + this.vspace(ast),
      getPropertyValue(ast, 'position') || (page ? 't' : null)
    );
  }

  raw(ast) {
    const format = getPropertyValue(ast, 'format');
    if (format !== 'tex') {
      return '';
    } else if (hasProperty(ast, 'place')) {
      const node = this.options.places.get(getPropertyValue(ast, 'place'));
      return node ? this._figure(node) : '';
    } else {
      return ast.children[0].value;
    }
  }

  vspace(ast) {
    const vsp = this.options.vspace.get(ast.name);
    return vsp ? `\\vspace{${vsp}}\n` : '';
  }
}
