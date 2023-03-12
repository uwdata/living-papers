import {
  createComponentNode, createTextNode, createProperties,
  isComponentNode, prependChildren
} from '@living-papers/ast';

export default function(ast) {
  const { metadata: { title, author } } = ast;
  const entries = [];

  if (title) {
    entries.push(create('h1', { role: 'banner' }, title));
  }

  // TODO: what set of author attributes are supported?
  // TODO: should author normalization be done elsewhere?
  if (author) {
    [ author ].flat().forEach(entry => {
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
      entries.push(create('div', { class: 'author' }, content));
    });
  }

  if (entries.length) {
    prependChildren(ast.article, create('header', null, entries));
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
