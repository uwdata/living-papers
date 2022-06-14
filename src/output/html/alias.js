const aliasMap = new Map([
  ['abstract', 'p'],
  ['acknowledgements', 'p'],
  ['caption', 'figcaption'],
  ['cite-list', 'span'],
  ['cross-list', 'span'],
  ['equation', 'tex-equation'],
  ['image', 'img'],
  ['math', 'tex-math'],
  ['link', 'a'],
  ['quote', 'q'],
  ['teaser', 'figure'],
  ['raw', null]
]);

export function aliasComponent(name) {
  return aliasMap.has(name) ? aliasMap.get(name) : name;
}

export function aliasProperty(name) {
  switch (name) {
    case 'bind': return 'data-bind';
    case 'bind-set': return 'data-bind-set';
    default: return name;
  }
}
