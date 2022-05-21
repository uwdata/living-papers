import {
  createTextNode, createComponentNode, createProperties, parseProperties,
  isTextNode, isBacktickQuoted, mergeTextNodes
} from '../ast/index.js';

import {
  append, extractText, isInterpolated,
  getQuoteType, getListType, getMarkerType, getTableCellAlign, getCiteMode
} from './parse-util.js';

import {
  MetaInlines, MetaList, MetaMap, MetaBool,
  Str, Space, SoftBreak, Quoted,
  Emph, Strong, Subscript, Superscript, Strikeout, SmallCaps, Underline,
  Para, Header, Math, CodeBlock, LineBlock, BlockQuote, HorizontalRule,
  Table, Note, Code, Image, Link,
  RawBlock, RawInline,
  Cite, AuthorInText, SuppressAuthor,
  BulletList, OrderedList,
  Div, Span, Plain
} from './pandoc-types.js';

/**
 * Parse a Pandoc AST in JSON format to the internal AST format.
 * @param {object} doc Pandoc JSON AST
 * @param {object} options Parsing content options
 * @returns {object} An internal AST
 */
export function parsePandocAST(doc, options = {}) {
  return new PandocASTParser(options).parse(doc);
}

export class PandocASTParser {
  constructor(options) {
    this.ctx = {
      fence: new Set(options.fence || []),
      block: new Set(options.block || []),
      xref: new Set(options.xref || []),
      env: new Set(options.env || [])
    };
  }

  blockLookup(item) {
    return this.componentLookup(item, this.ctx.block);
  }

  fenceLookup(item) {
    return this.componentLookup(item, this.ctx.fence);
  }

  componentLookup(item, lookup) {
    const [attrs, content] = item;
    const [id, classes, props] = attrs;
    const cls = classes.find(c => lookup.has(c));

    if (cls) {
      item = [
        [id, classes.filter(c => c !== cls), props],
        content,
        cls
      ];
    }
    return item;
  }

  spanLookup(item) {
    const [attrs, span] = item;
    if (span.length && span[0].t === Str) {
      const str = span[0].c;
      if (/^:.*:$/.test(str)) {
        const name = str.slice(1, -1);
        const skip = span[1]?.t === Space ? 2 : 1;
        return [attrs, span.slice(skip), name];
      }
    }
    return [attrs, span];
  }

  ///////////////////////////////////////

  parse(doc) {
    const { meta, blocks } = doc;
    return {
      metadata: this.parseMetaMap(meta),
      article: createComponentNode(
        'article',
        null,
        this.parseBlocks(blocks)
      )
    };
  }

  parseMetaMap(map) {
    const object = {};
    for (const key in map) {
      object[key] = this.parseMetaValue(map[key]);
    }
    return object;
  }

  parseMetaList(list) {
    return list.map(item => this.parseMetaValue(item));
  }

  parseMetaValue(value) {
    const { t: type, c: content } = value;

    let result;
    switch (type) {
      case MetaInlines:
        result = this.parseInline(content);
        return result.length === 1 && isTextNode(result[0])
          ? result[0].value
          : createComponentNode('span', null, result);
      case MetaList:
        return this.parseMetaList(content);
      case MetaMap:
        return this.parseMetaMap(content);
      case MetaBool:
        return content;
      default:
        throw new Error(`Unrecognized metadata type: ${type}.`);
    }
  }

  parseBlocks(blocks) {
    const nodes = [];

    for (let index = 0; index < blocks.length; ++index) {
      const block = blocks[index];
      const { t: type, c: content } = block;

      let child;
      switch (type) {
        case Header:
          child = this.parseHeader(content);
          break;
        case Para:
          child = this.parsePara(content);
          break;
        case Plain:
          append(nodes, this.parseInline(content));
          break;
        case HorizontalRule:
          child = createComponentNode('hr');
          break;
        case BlockQuote:
          child = this.parseBlockQuote(content);
          break;
        case LineBlock:
          child = this.parseLineBlock(content);
          break;
        case Table:
          child = this.parseTable(content);
          break;
        case BulletList:
          child = this.parseBulletList(content);
          break;
        case OrderedList:
          child = this.parseOrderedList(content);
          break;
        case CodeBlock:
          child = this.parseCodeBlock(content);
          break;
        case Div:
          child = this.parseDiv(content);
          break;
        case RawBlock:
          child = this.parseRaw(content);
          break;
        default:
          throw new Error(`Unrecognized block element: ${type}`);
      }
      if (child) {
        nodes.push(child);
      }
    }

    return nodes;
  }

  parseInline(blocks) {
    const nodes = [];

    for (let index = 0; index < blocks.length; ++index) {
      const block = blocks[index];
      const { t: type, c: content } = block;

      let child;
      switch (type) {
        case Str:
          child = createTextNode(content);
          break;
        case Space:
          child = createTextNode(' ');
          break;
        case SoftBreak:
          child = createTextNode('\n');
          break;
        case Emph:
          child = this.parseInlineElement('em', content);
          break;
        case Strong:
          child = this.parseInlineElement('strong', content);
          break;
        case Subscript:
          child = this.parseInlineElement('sub', content);
          break;
        case Superscript:
          child = this.parseInlineElement('sup', content);
          break;
        case Strikeout:
          child = this.parseInlineElement('s', content);
          break;
        case SmallCaps:
          child = this.parseInlineElement('span', content, 'smallcaps');
          break;
        case Underline:
          child = this.parseInlineElement('span', content, 'underline');
          break;
        case Link:
          child = this.parseLink(content);
          break;
        case Image:
          child = this.parseImage(content);
          break;
        case Code:
          child = this.parseCode(content);
          break;
        case Math:
          child = this.parseMath(content);
          break;
        case Quoted:
          child = this.parseQuoted(content);
          break;
        case Note:
          child = this.parseNote(content);
          break;
        case Cite:
          child = this.parseReferences(content);
          break;
        case Span:
          child = this.parseSpan(content);
          break;
        case RawInline:
          child = this.parseRaw(content);
          break;
        default:
          throw new Error(`Unrecognized inline element: ${type}`);
      }
      if (child) {
        nodes.push(child);
      }
    }

    return mergeTextNodes(nodes);
  }

  // -- Block elements --

  parseHeader(item) {
    const [level, attrs, content] = item;
    return createComponentNode(
      `h${level}`,
      parseProperties(attrs),
      this.parseInline(content)
    );
  }

  parsePara(content) {
    return createComponentNode(
      'p',
      null,
      this.parseInline(content)
    );
  }

  parseBlockQuote(content) {
    return createComponentNode(
      'blockquote',
      null,
      this.parseBlocks(content)
    );
  }

  parseLineBlock(lines) {
    return createComponentNode(
      'lineblock',
      null,
      [
        createComponentNode(
          'line',
          null,
          lines.map(line => this.parseInline(line))
        )
      ]
    );
  }

  parseBulletList(content) {
    return createComponentNode(
      'ul',
      null,
      this.parseListItems(content)
    );
  }

  parseOrderedList(item) {
    const [ [start, { t: type }, { t: marker }], content ] = item;
    return createComponentNode(
      'ol',
      createProperties({
        start: start === 1 ? undefined : start,
        type: getListType(type),
        marker: getMarkerType(marker)
      }),
      this.parseListItems(content)
    );
  }

  parseListItems(items) {
    return items.map(item => createComponentNode(
      'li',
      null,
      this.parseListItem(item)
    ));
  }

  parseListItem(item) {
    const children = [];
    item.forEach(entry => {
      append(children, this.parseBlocks([entry]));
    });
    return children;
  }

  parseCodeBlock(item) {
    const [attrs, content, name = 'code-block'] = this.blockLookup(item);
    return createComponentNode(
      name,
      parseProperties(attrs),
      [ createTextNode(content) ]
    );
  }

  parseDiv(item) {
    item = this.fenceLookup(item);
    const [attrs, content, name = 'div'] = item;
    return this.ctx.env.has(name)
      ? this.parseEnv(item)
      : createComponentNode(
          name,
          parseProperties(attrs),
          this.parseBlocks(content)
        );
  }

  parseEnv(item) {
    const [attrs, content, name] = item;
    const [id, classes, props] = attrs;

    // extract captions from line blocks
    const children = content.map(block => {
      if (block.t === LineBlock) {
        const cap = [];
        block.c.forEach((l, i) => {
          if (i > 0) cap.push({ t: SoftBreak });
          l.forEach(({ t, c }) => cap.push({ t, c: t === Str ? c.trim() : c }));
        });
        return createComponentNode('caption', null, this.parseInline(cap))
      } else {
        return this.parseBlocks([block])[0];
      }
    });

    // create component, inject name as a class
    return createComponentNode(
      name,
      parseProperties([id, [name, ...classes], props]),
      children
    );
  }

  parseTable(content) {
    // eslint-disable-next-line no-unused-vars
    const [ attrs, caption, columns, head, [body], foot ] = content;

    // caption [null?, content]

    // columns (array of align / width)
    // [ [{"t":"AlignRight"},{"t":"ColWidthDefault"}] ]
    // or: {"t":"ColWidth","c":0.16666666666666666}
    const styles = this.tableColumnStyles(columns);

    // head [attrs, rows]
    // row => [attrs, cells]
    // cell => [attrs, align, rowspan, colspan, content]
    const thead = createComponentNode(
      'thead',
      parseProperties(head[0]),
      this.parseTableRows('th', styles, head[1])
    );

    // body [attrs, rowHeadColumns, [], rows]
    const tbody = createComponentNode(
      'tbody',
      parseProperties(body[0]),
      this.parseTableRows('td', styles, body[3])
    );

    // foot [attrs, content]
    // TODO?

    return createComponentNode(
      'table',
      parseProperties(attrs),
      [ thead, tbody ]
    );
  }

  parseTableRows(type, styles, rows) {
    return rows.map(row => {
      const [attrs, cells] = row;
      return createComponentNode(
        'tr',
        parseProperties(attrs),
        this.parseTableCells(type, styles, cells)
      );
    });
  }

  parseTableCells(type, styles, cells) {
    return cells.map((cell, i) => {
      const style = styles[i];
      // eslint-disable-next-line no-unused-vars
      const [attrs, align, rowspan, colspan, content] = cell;
      return createComponentNode(
        type,
        parseProperties(attrs, null, style),
        this.parseBlocks(content)
      );
    });
  }

  tableColumnStyles(styles) {
    return styles.map(style => {
      const [ {t: align} /*, {t: width} */ ] = style;
      return getTableCellAlign(align);
    });
  }

  // -- Inline elements --

  parseInlineElement(name, content, classes) {
    return createComponentNode(
      name,
      classes ? { class: classes } : null,
      this.parseInline(content)
    );
  }

  parseQuoted(item) {
    const [ { t: type }, content ] = item;
    return createComponentNode(
      'quote',
      createProperties({
        class: getQuoteType(type)
      }),
      this.parseInline(content)
    );
  }

  parseMath(item) {
    const [ , content ] = item;
    return createComponentNode(
      'math',
      createProperties({
        mode: 'inline',
        code: isInterpolated(content) ? `\`\`${content}\`\`` : content
      })
    );
  }

  parseCode(item) {
    const [ attrs, content ] = item;
    return createComponentNode(
      'code',
      parseProperties(attrs),
      [ createTextNode(content) ]
    );
  }

  parseImage(item) {
    const [ attrs, alt, [src, title] ] = item;
    const props = {
      alt: extractText(alt) || undefined,
      src: src || undefined,
      title: (title !== ':fig' && title) || undefined
    };
    return createComponentNode(
      'image',
      parseProperties(attrs, props),
    );
  }

  parseLink(item) {
    const [ attrs, content, [href, title] ] = item;
    const link = href ? decodeURI(href) : undefined;
    const code = isBacktickQuoted(link);
    const props = {
      onclick: code ? link : undefined,
      href: code ? '#' : link,
      title: title || undefined
    };
    return createComponentNode(
      'link',
      parseProperties(attrs, props),
      this.parseInline(content)
    );
  }

  parseSpan(item) {
    const [ attrs, content, name = 'span' ] = this.spanLookup(item);
    return createComponentNode(
      name,
      parseProperties(attrs),
      this.parseInline(content)
    );
  }

  parseNote(content) {
    return createComponentNode(
      'note',
      null,
      this.parseBlocks(content)
    );
  }

  // -- Cite and Xref elements --

  parseReferences(item) {
    const [ refs ] = item;
    let xref = 0;
    let cite = 0;

    refs.forEach(ref => {
      const { citationId: key } = ref;
      this.isXrefKey(key) ? ++xref : ++cite;
    });

    if (xref === refs.length) {
      return this.parseXref(item);
    } else if (cite === refs.length) {
      return this.parseCite(item);
    } else {
      throw new Error('Citations and cross-references can not be mixed.');
    }
  }

  parseXref(item) {
    const nodes = [];
    const [ refs/*, content */ ] = item;

    refs.forEach(ref => {
      const {
        citationId: key,
        citationPrefix: prefix,
        citationSuffix: suffix,
        citationMode: { t: mode }
      } = ref;

      if (prefix) append(nodes, this.parseInline(prefix));

      const [keyName, keyValue] = this.getXrefKey(key);
      const attrs = {
        type: keyName,
        xref: keyValue,
        short: mode === SuppressAuthor ? true : undefined
      };

      nodes.push(createComponentNode('cross-ref', createProperties(attrs)));

      if (suffix) append(nodes, this.parseInline(suffix));
    });

    if (nodes.length === 1) {
      return nodes[0];
    }

    return createComponentNode(
      'cross-list',
      createProperties({ class: 'cross-list' }),
      nodes
    );
  }

  parseCite(item) {
    const [ cites/*, content */ ] = item;

    const nodes = cites.map(cite => {
      const {
        citationId: key,
        citationPrefix: prefix,
        citationSuffix: suffix,
        citationMode: { t: mode }
      } = cite;

      const children = [];
      if (prefix.length) {
        children.push(
          createComponentNode(
            'span',
            createProperties({ slot: 'prefix' }),
            this.parseInline(prefix)
          )
        );
      }
      if (suffix.length) {
        children.push(
          createComponentNode(
            'span',
            createProperties({ slot: 'suffix' }),
            this.parseInline(suffix)
          )
        );
      }

      return createComponentNode(
        'cite-ref',
        createProperties({ key, mode: getCiteMode(mode) }),
        children
      );
    });

    return nodes.length === 1 && cites[0].citationMode.t === AuthorInText
      ? nodes[0]
      : createComponentNode('cite-list', null, nodes);
  }

  isXrefKey(key) {
    const [type, ...rest] = key.split(':');
    return rest.length && this.ctx.xref.has(type);
  }

  getXrefKey(key) {
    const [type, ...rest] = key.split(':');
    return [type, rest.join(':')];
  }

  // -- Comments --

  parseRaw(content) {
    const [format, text] = content;
    return createComponentNode(
      'raw',
      createProperties({ format }),
      [ createTextNode(text) ]
    );
  }
}
