import {
  createTextNode, getPropertyValue, hasClass,
  removeProperty, setValueProperty, visitNodes
} from '@living-papers/ast';

import { LANGUAGE } from '../../util/languages.js';

const JS_LANG = 'js';

/**
 * Rewrite JavaScript code components to reactive runtime cells.
 * @param {object} ast The AST to transform.
 * @returns {object} The input AST, transformed in-place.
 */
export default function(ast) {
  visitNodes(ast.article, node => {
    if (node.name === 'code') {
      const code = node.children[0].value;
      if (code.startsWith(`${JS_LANG} `)) {
        node.name = 'cell-view';
        setValueProperty(node, 'inline', true);
        node.children = [
          createTextNode(code.slice(JS_LANG.length + 1))
        ];
      }
    } else if (node.name === 'codeblock') {
      if (getPropertyValue(node, LANGUAGE) === JS_LANG && !hasClass(node, 'code')) {
        node.name = 'cell-view';
        removeProperty(node, LANGUAGE);
      }
    }
  });

  return ast;
}
