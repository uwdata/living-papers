import {
  getChildren, getNodeName, getPropertyValue,
  setValueProperty, visitNodes
} from '../../ast/index.js';

const ID = 'id';
const COUNTER = 'data-counter';
const CAPTION = 'caption';
const NONUMBER = 'nonumber';

export default function(counts, lookup) {
  return function(ast) {
    const sections = nestedCounter();

    function set(node, value) {
      const id = getPropertyValue(node, ID);
      if (id != null) {
        lookup.set(id, value + '');
      }
      setValueProperty(node, COUNTER, value);
      return value;
    }

    visitNodes(ast, node => {
      if (hasNoNumber(node)) return;

      const name = getNodeName(node);
      if (counts.has(name)) {
        const value = counts.get(name) + 1;
        counts.set(name, set(node, value));

        // check immediate children, update caption elements
        for (const child of getChildren(node)) {
          if (getNodeName(child) === CAPTION) {
            set(child, value);
          }
        }
      } else if (isHeader(node)) {
        set(node, sections(headerLevel(node)));
      }
    });

    return ast;
  };
}

function hasNoNumber(node) {
  return bool(getPropertyValue(node, NONUMBER));
}

function bool(value) {
  return (typeof value === 'string')
    ? value.toLowerCase() !== 'false'
    : !!value;
}

function isHeader(node) {
  return /^h\d$/.test(getNodeName(node));
}

function headerLevel(node) {
  return +getNodeName(node).slice(1);
}

function nestedCounter() {
  const tally = [0];
  let depth = 1;

  return function(level) {
    while (depth > level) {
      --depth;
      tally.pop();
    }
    while (depth < level) {
      ++depth;
      tally.push(0);
    }
    tally[tally.length - 1] += 1;
    return tally.join('.');
  };
}
