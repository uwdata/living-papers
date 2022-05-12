export function splitCodeCells(code) {
  return code.split(/\n\s*(?:---+|~~~+)\s*\n/g);
}

export function joinCodeCells(cells) {
  return cells.join('\n---\n');
}
