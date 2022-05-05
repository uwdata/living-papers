import {
  createComponentNode, getPropertyValue, hasProperty,
  setValueProperty, visitNodes
} from '../../ast/index.js';

const LANGUAGE = 'language';

export default function(ast) {
  visitNodes(ast, node => {
    switch (node.name) {
      case 'code': return codeInline(node);
      case 'code-block': return codeBlock(node);
    }
  });
  return ast;
}

function codeAttributes(node) {
  const classNames = getPropertyValue(node, 'class');
  if (!hasProperty(LANGUAGE) && classNames) {
    const classes = classNames.split(/\s+/);
    setValueProperty(node, 'class', classes.slice(1).join(' '));
    setValueProperty(node, LANGUAGE, classes[0]);
  }
  return getPropertyValue(node, LANGUAGE);
}

function codeBlock(node) {
  if (!codeAttributes(node)) {
    node.name = 'pre';
    node.children = [ createComponentNode('code', null, node.children) ];
  }
}

function codeInline(node) {
  if (codeAttributes(node)) {
    node.name = 'code-block';
    setValueProperty(node, 'inline', true);
  }
}
