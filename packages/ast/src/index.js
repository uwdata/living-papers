export {
  createTextNode,
  createComponentNode,
  isTextNode,
  isComponentNode,
  isCustomComponentNode,
  getNodeName,
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
  hasProperty,
  hasExpressionProperty,
  getProperty,
  setProperty,
  setValueProperty,
  removeProperty,
  hasClass,
  getClasses,
  removeClass,
  addClass,
  getChildren,
  appendChildren,
  prependChildren,
  removeChild,
  replaceChild,
  cloneNode,
  visitNodes,
  queryNodes,
  mergeTextNodes,
  extractText
} from './util.js';

export {
  transformAST
} from './transform-ast.js';

export {
  createRange,
  queryRange,
  queryPath
} from './range.js';
