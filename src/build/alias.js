const aliasMap = new Map([
  ['caption', 'figcaption'],
  ['cite-list', 'span'],
  ['cross-list', 'span'],
  ['equation', 'tex-equation'],
  ['image', 'img'],
  ['math', 'tex-math'],
  ['note', 'span'],
  ['link', 'a'],
  ['quote', 'span']
]);

export function aliasComponent(name) {
  return aliasMap.get(name) || name;
}

export function aliasProperty(name) {
  if (name === 'bind') {
    return 'data-bind';
  }
  return name;
}
