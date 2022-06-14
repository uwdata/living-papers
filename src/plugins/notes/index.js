import { queryNodes } from '../../ast/index.js';

export default function (ast, { logger }) {
  queryNodes(ast, node => node.name === 'inline-note').forEach(node => {
    if (node.children.length > 1) {
      logger.warn('Dropping extraneous content from inline note.');
    }
    node.children = node.children?.[0].children;
  });
  return ast;
}
