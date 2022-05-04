const aliasMap = new Map([
  ['caption', 'figcaption'],
  ['code', 'code-block'],
  ['cross-list', 'span'],
  ['equation', 'tex-equation'],
  ['image', 'img'],
  ['math', 'tex-math'],
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
