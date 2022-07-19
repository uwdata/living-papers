import {
  createComponentNode, createTextNode, createProperties,
  isComponentNode, prependChildren
} from '../../ast/index.js';

export default function(ast, context) {
  const { metadata: { title, author } } = context;
  const entries = [];

  if (title) {
    entries.push(create('h1', { role: 'banner' }, title));
  }

  // TODO: what set of author attributes are supported?
  // TODO: should author normalization be done elsewhere?
  if (author) {
    const authorNodes = [ author ].flat().map(entry => {
      const content = [];
      if (typeof entry === 'string') {
        content.push(createTextNode(entry));
      } else {
        if (entry.name) {
          content.push(create('span', { class: 'author-name' }, entry.name));
        }
        if (entry.org) {
          content.push(create('span', { class: 'author-org' }, entry.org));
        }
      }
      return create('div', { class: 'author' }, content);
    });
    entries.push(create('div', { class: 'authors' }, authorNodes));
  }

  if (entries.length) {
    prependChildren(ast, create('header', null, entries));
  }

  return ast;
}

function create(tag, props, content) {
  return createComponentNode(
    tag,
    createProperties(props),
    [ inlineContent(content) ].flat()
  );
}

function inlineContent(value) {
  // TODO if content is single-child span, we could extract the child
  return Array.isArray(value) ? value
    : isComponentNode(value) ? value
    : createTextNode(value);
}
