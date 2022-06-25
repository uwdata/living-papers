import { visitNodes } from '../../ast/index.js';

export default function (ast, { logger }) {
  visitNodes(ast, node => {
    if (node.name === 'note') {
      if (node.children.length > 1) {
        logger.warn('Dropping extraneous content from inline note.');
      }
      node.children = node.children?.[0].children;
    }
  });
  return ast;
}
