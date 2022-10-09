import { createRequire } from 'node:module';

export function nodeResolver(
  baseURL = new URL('../..', import.meta.url)
) {
  const { resolve } = createRequire(baseURL);
  const localPattern = /^(?:\.\/|\.\.\/|\/|[A-Za-z]:)/;

  return (id, prefix = '') => {
    const pkg = `${id}/package.json`;
    return localPattern.test(pkg) ? pkg : resolve(`${prefix}${pkg}`);
  }
}
