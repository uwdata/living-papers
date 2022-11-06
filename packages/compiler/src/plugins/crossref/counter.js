import {
  getChildren, getPropertyValue, setValueProperty, visitNodes
} from '@living-papers/ast';

const ID = 'id';
const COUNTER = 'data-counter';
const CAPTION = 'caption';
const NONUMBER = 'nonumber';

export default function(toKey, lookup) {
  return function(ast) {
    const sections = nestedCounter();
    const counts = new Map;

    function set(node, value) {
      const id = getPropertyValue(node, ID);
      if (id != null) {
        lookup.set(id, value + '');
      }
      setValueProperty(node, COUNTER, value);
      return value;
    }

    visitNodes(ast.article, node => {
      if (hasNoNumber(node)) return;

      const key = toKey(node);
      if (key) {
        const value = (counts.get(key) || 0) + 1;
        counts.set(key, set(node, value));

        // check immediate children, update caption elements
        for (const child of getChildren(node)) {
          if (child.name === CAPTION) {
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
  return /^h\d$/.test(node.name);
}

function headerLevel(node) {
  return +node.name.slice(1);
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
