const aliasMap = new Map([
  ['abstract', 'p'],
  ['acknowledgements', 'p'],
  ['caption', 'figcaption'],
  ['cite-list', 'span'],
  ['cross-list', 'span'],
  ['equation', 'tex-equation'],
  ['image', 'img'],
  ['math', 'tex-math'],
  ['note', 'span'],
  ['link', 'a'],
  ['quote', 'q'],
  ['teaser', 'figure'],
  ['raw', null]
]);

export function aliasComponent(name) {
  return aliasMap.has(name) ? aliasMap.get(name) : name;
}

export function aliasProperty(name) {
  if (name === 'bind') {
    return 'data-bind';
  }
  return name;
}
