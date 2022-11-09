import {
  getClasses, hasProperty,
  removeClass, setValueProperty, visitNodes
} from '@living-papers/ast';

import { LANGUAGE, languages } from './languages.js';

export default function(ast) {
  visitNodes(ast.article, node => {
    switch (node.name) {
      case 'code':
      case 'codeblock':
        if (!hasProperty(node, LANGUAGE)) {
          const classes = getClasses(node);
          const lang = classes.find(c => languages.has(c));
          if (lang) {
            removeClass(node, lang);
            setValueProperty(node, LANGUAGE, lang);
          }
        }
    }
  });
  return ast;
}
