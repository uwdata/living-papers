export function observer(node) {
  return {
    pending() {
      // do nothing
    },
    fulfilled(value, name) {
      // update
      if (isNode(value)) {
        const _node = node;
        if (_node.firstChild !== value) {
          if (_node.firstChild) {
            while (_node.lastChild !== _node.firstChild) _node.removeChild(_node.lastChild);
            _node.replaceChild(value, _node.firstChild);
          } else {
            _node.appendChild(value);
          }
        }
      } else {
        // TODO additional formatting, etc.
        node.innerText = value + '';
      }
    },
    rejected(error, name) {
      // error
      console.error('OJS ERROR', error, name);
    }
  };
}

function isNode(value) {
  return (
    (typeof Element === 'function' && value instanceof Element) ||
    (typeof Text === 'function' && value instanceof Text)
  ) && (value instanceof value.constructor);
}
