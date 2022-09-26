import { hasClass } from '@living-papers/ast';
import { default as counter } from './counter.js';
import { default as crossref } from './crossref.js';

export default function(numbered) {
  const lookup = new Map();
  const count = counter(keyFunction(numbered), lookup);
  const xref = crossref(lookup);

  return function(ast, context) {
    return xref(count(ast), context);
  };
}

function keyFunction(numbered) {
  const types = new Map();
  numbered.forEach(([name, classes]) => {
    if (!types.has(name)) types.set(name, []);
    if (classes) types.get(name).push(classes);
  });

  return node => {
    const { name } = node;
    if (types.has(name)) {
      for (const classes of types.get(name)) {
        if (classes.some(cls => hasClass(node, cls))) {
          return `${name}.${classes[0]}`;
        }
      }
      return name;
    }
    return null;
  };
}
