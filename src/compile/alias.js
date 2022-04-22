const aliasMap = new Map()
  .set('observable', 'obs-cell')
  .set('math', 'tex-math')
  .set('equation', 'tex-equation');

export function aliasComponent(name) {
  return aliasMap.get(name) || name;
}

export function aliasProperty(name) {
  return name === 'className' ? 'class' : name;
}
