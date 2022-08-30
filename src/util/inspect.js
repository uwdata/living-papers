import util from 'node:util';

export function inspect(value) {
  return util.inspect(value, {showHidden: false, depth: null, colors: true});
}
