import {
  getChildren, getPropertyValue, getPropertyBoolean, setValueProperty, visitNodes, removeProperty
} from '@living-papers/ast';

const ID = 'id';
const COUNTER = 'data-counter';
const CAPTION = 'caption';
const NONUMBER = 'nonumber';
const APPENDIX = 'appendix';

export default function(toKey, lookup) {
  return function(ast) {
    const sections = nestedCounter();
    const appendices = nestedCounter(alphaLabel);
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
        const isAppendix = getPropertyValue(node, APPENDIX);
        const level = headerLevel(node);
        if (isAppendix) {
          set(node, appendices(level));
          removeProperty(node, APPENDIX);
        } else {
          set(node, sections(level));
        }
      }
    });

    return ast;
  };
}

function hasNoNumber(node) {
  return getPropertyBoolean(node, NONUMBER);
}

function isHeader(node) {
  return /^h\d$/.test(node.name);
}

function headerLevel(node) {
  return +node.name.slice(1);
}

function nestedCounter(valueof = numberLabel) {
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
    return valueof(tally);
  };
}

function numberLabel(tally) {
  return tally.join('.');
}

function alphaLabel(tally) {
  return toAlpha(tally[0]) + (tally.length > 1
    ? ('.' + numberLabel(tally.slice(1)))
    : '');
}

function toAlpha(index) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let label = '';
  for (let i = index; i > 0; i = Math.floor((i-1) / 26)) {
    label = letters[(i-1) % 26] + label;
  }
  return label;
}
