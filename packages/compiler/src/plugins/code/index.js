import {
  createComponentNode, getClasses, getPropertyValue, hasProperty,
  removeClass, setValueProperty, visitNodes
} from '@living-papers/ast';
import { languages } from './languages.js';

const LANGUAGE = 'language';

export default function(ast) {
  visitNodes(ast, node => {
    switch (node.name) {
      case 'code': return codeInline(node);
      case 'codeblock': return codeBlock(node);
    }
  });
  return ast;
}

function codeAttributes(node) {
  if (!hasProperty(LANGUAGE)) {
    const classes = getClasses(node);
    const lang = classes.find(c => languages.has(c));
    if (lang) {
      removeClass(node, lang);
      setValueProperty(node, LANGUAGE, lang);
    }
  }
  return getPropertyValue(node, LANGUAGE);
}

// TODO remove from here, make part of HTML output
function codeBlock(node) {
  if (!codeAttributes(node)) {
    node.name = 'pre';
    node.children = [ createComponentNode('code', null, node.children) ];
  }
}

function codeInline(node) {
  if (codeAttributes(node)) {
    node.name = 'codeblock';
    setValueProperty(node, 'inline', true);
  }
}
