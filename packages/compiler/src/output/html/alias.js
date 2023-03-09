import { namespace } from '@living-papers/ast';

const aliasMap = new Map([
  ['abstract', 'p'],
  ['acknowledgments', 'p'],
  ['caption', 'figcaption'],
  ['citelist', 'span'],
  ['citeref', 'cite-ref'],
  ['codeblock', 'code-block'],
  ['crosslist', 'span'],
  ['crossref', 'cross-ref'],
  ['equation', 'tex-equation'],
  ['image', 'img'],
  ['math', 'tex-math'],
  ['note', 'inline-note'],
  ['link', 'a'],
  ['quote', 'q'],
  ['sticky', 'div'],
  ['teaser', 'figure'],
  ['raw', null] // TODO pass through raw html?
]);

export function aliasComponent(name) {
  return aliasMap.has(name) ? aliasMap.get(name) : name;
}

export function aliasProperty(name) {
  // drop properties that target other output formats
  if (namespace(name, 'html') !== 'html') return null;

  // map non-standard properties to the "data-" namespace
  switch (name) {
    case 'bind': return 'data-bind';
    case 'bind-set': return 'data-bind-set';
    default: return name;
  }
}
