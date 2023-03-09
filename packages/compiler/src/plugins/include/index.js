import path from 'node:path';
import {
  createComponentNode, createProperties, createTextNode, getPropertyValue,
  removeChild, replaceChild, visitNodes
} from '@living-papers/ast';
import { readFile } from '../../util/fs.js';
import parse from '../../parse/index.js';

const INCLUDE = 'include';

export default async function(ast, context) {
  const includes = [];
  visitNodes(ast.article, (node, parent, grandparent) => {
    if (node.name === INCLUDE) {
      includes.push([node, parent, grandparent]);
    }
  });

  for (const [node, parent, grandparent] of includes) {
    const content = await getIncludedContent(node, context);
    const sp = parent.children.length === 1 && parent.name === 'p'; // parent paragraph?
    const cp = content.length === 1 && content[0].name === 'p'; // content paragraph?
    if (content.length === 0) {
      // no included content, remove container node
      if (sp) {
        removeChild(grandparent, parent);
      } else {
        removeChild(parent, node);
      }
    } else if (sp) {
      // include was placed on its own line, replace parent container paragraph
      replaceChild(grandparent, parent, content);
    } else if (content.length === 1 && content[0].name === 'raw') {
      replaceChild(parent, node, content);
    } else if (parent.name === 'p' && !cp) {
      // inserting block content into a parent paragraph with other content
      context.logger.warn('Include: block content included in an inline context');
      removeChild(parent, node);
    } else {
      // include among content, insert content under parent node
      // if content has a container paragraph, extract internal content
      replaceChild(parent, node, cp ? content[0].children : content);
    }
  }

  return ast;
}

async function getIncludedContent(node, context) {
  const format = getPropertyValue(node, 'raw');
  const file = getPropertyValue(node, 'file');
  const inputFile = path.join(context.inputDir, file);
  try {
    if (format) {
      // include as raw format-specific content
      return [
        createComponentNode(
          'raw',
          createProperties({ format }),
          [ createTextNode(await readFile(inputFile)) ]
        )
      ];
    } else {
      // include as parsed AST content
      // TODO: infer inputType?
      const ast = await parse({ ...context, inputFile });
      return ast.article.children;
    }
  } catch (error) {
    context.logger.error(`Error including ${file}`, error);
    return [];
  }
}
