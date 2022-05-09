import { default as counter } from './counter.js';
import { default as crossref } from './crossref.js';

export default function(nodeNames) {
  const lookup = new Map();
  const counts = new Map();
  nodeNames.forEach(name => counts.set(name, 0));

  const count = counter(counts, lookup);
  const xref = crossref(lookup);

  return function(ast, context) {
    return xref(count(ast), context);
  };
}
