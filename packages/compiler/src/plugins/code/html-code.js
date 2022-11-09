import {
  createComponentNode, hasProperty, setValueProperty, visitNodes
} from '@living-papers/ast';

import { LANGUAGE } from './languages.js';

export default function(ast) {
  visitNodes(ast.article, node => {
    switch (node.name) {
      case 'code': return codeInline(node);
      case 'codeblock': return codeBlock(node);
    }
  });
  return ast;
}

function codeInline(node) {
  if (hasProperty(node, LANGUAGE)) {
    node.name = 'codeblock';
    setValueProperty(node, 'inline', true);
  }
}

function codeBlock(node) {
  if (!hasProperty(node, LANGUAGE)) {
    node.name = 'pre';
    node.children = [ createComponentNode('code', null, node.children) ];
  }
}
