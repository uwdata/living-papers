export {
  META,
  TEXTNODE,
  COMPONENT,
  createNode,
  createTextNode,
  createMetaNode,
  createComponentNode,
  isTextNode,
  isMetaNode,
  isComponentNode,
  isCustomComponentNode,
  getNodeName,
  cloneNode,
  mergeTextNodes
} from './nodes.js';

export {
  VALUE,
  EXPRESSION,
  EVENT,
  parseProperties,
  createProperties,
  isBacktickQuoted,
  hasProperties,
  getProperties,
  setProperties,
  clearProperties,
  getPropertyKeys,
  getPropertyType,
  getPropertyValue,
  getPropertyBoolean,
  hasProperty,
  hasExpressionProperty,
  hasEventProperty,
  getProperty,
  setProperty,
  setValueProperty,
  removeProperty,
  extractProperties,
} from './properties.js';

export {
  hasClass,
  getClasses,
  removeClass,
  addClass,
} from './classes.js';

export {
  getChildren,
  appendChildren,
  prependChildren,
  removeChild,
  replaceChild,
} from './children.js';

export {
  getArticleData,
  setArticleDataProperty,
  setArticleDataProperties
} from './data.js';

export {
  visitNodes,
  queryNodes,
  queryNode
} from './visit.js';

export {
  extractText
} from './extract-text.js';

export {
  createRange,
  queryRange,
  queryPath
} from './range.js';

export {
  setParentNodes
} from './set-parent-nodes.js';

export {
  namespace,
  excludesNamespace
} from './namespace.js';

export {
  cloneAST
} from './clone-ast.js';

export {
  transformAST
} from './transform-ast.js';
