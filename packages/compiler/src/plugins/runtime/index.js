import {
  createTextNode, hasClass, setValueProperty, visitNodes
} from '@living-papers/ast';

export default function(ast) {
  const lang = 'js';
  visitNodes(ast.article, node => {
    let code;
    switch (node.name) {
      case 'code':
        code = node.children[0].value;
        if (code.startsWith(`${lang} `)) {
          node.name = 'cell-view';
          setValueProperty(node, 'inline', true);
          node.children = [
            createTextNode(code.slice(lang.length + 1))
          ];
        }
        break;

      case 'codeblock':
        if (hasClass(node, lang) && !hasClass(node, 'code')) {
          node.name = 'cell-view';
        }
        break;
    }
  });

  return ast;
}
