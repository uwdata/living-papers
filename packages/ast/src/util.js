const VALUE = 'value';
const EVENT = 'event';
const EXPRESSION = 'expression';
const TEXTNODE = 'textnode';
const COMPONENT = 'component';

// -- AST Nodes ----

export function createTextNode(text = '') {
	return {
		type: TEXTNODE,
		value: String(text)
	};
}

export function createComponentNode(name, properties, children) {
  const hasProps = properties && Object.keys(properties).length;
  const hasKids = children && children.length;
	return {
		type: COMPONENT,
    name: name.toLowerCase(),
		properties: hasProps ? properties : undefined,
		children: hasKids ? children : undefined
	};
}

export function isTextNode(ast) {
	return ast.type === TEXTNODE;
}

export function isComponentNode(ast) {
	return ast.type === COMPONENT;
}

export function isCustomComponentNode(ast) {
  return isComponentNode(ast) && ast.name?.includes('-');
}

export function getNodeName(ast) {
  return ast?.name;
}

// -- AST Node Properties ----

export function parseProperties([id, classes, props], extraProps, extraClasses) {
  classes = [...(classes || []), ...(extraClasses || [])];
  return createProperties({
    id: id || undefined,
    class: classes.length ? classes.join(' ') : undefined,
    ...Object.fromEntries(props),
    ...extraProps
  });
}

export function createProperties(data) {
  if (!data) return undefined;
  const props = {};
  for (const key in data) {
    const entry = data[key];
    if (entry !== undefined) {
      const backtick = isBacktickQuoted(entry);
      const event = key.startsWith('on');
      const name = event ? key.slice(2) : key;
      props[name.toLowerCase()] = {
        type: event ? EVENT : backtick ? EXPRESSION : VALUE,
        value: backtick ? entry.slice(1, -1) : entry
      };
    }
  }
  return props;
}

export function isBacktickQuoted(str) {
  return typeof str === 'string' && str.startsWith('`') && str.endsWith('`');
}

function hasKeys(object) {
  for (const key in object) return true;
  return false;
}

/**
 * Tests if an AST node has any defined properties.
 * @param {*} node The AST node.
 * @returns {boolean} True is the node has properties, false otherwise.
 */
export function hasProperties(node) {
  return hasKeys(node.properties);
}

/**
 * Retrieves the properties object for an AST node.
 * @param {object} node The AST node.
 * @returns {object} The properties object, or null if none.
 */
export function getProperties(node) {
  return node.properties || null;
}

/**
 * Add a set of properties to an AST node. Any existing
 * properties with matching keys will be overwritten.
 * @param {object} node The AST node.
 * @param {object} properties A properties object. Object keys are
 *  property names, object values must be property data objects.
 * @returns {object} The modified AST node.
 */
export function setProperties(node, properties) {
  for (const key in properties) {
    setProperty(node, key, properties[key]);
  }
  return node;
}

/**
 * Remove all properties from an AST node.
 * @param {object} node The AST node.
 * @returns {object} The modified AST node.
 */
export function clearProperties(node) {
  delete node.properties;
  return node;
}

/**
 * Retrieves an array of property keys for a node.
 * @param {object} node The AST node.
 * @return {string[]} The property keys, or an empty array if none.
 */
export function getPropertyKeys(node) {
  return Object.keys(node.properties || {});
}

/**
 * Retrieves the property type for a node property.
 * @param {object} node The AST node.
 * @param {string} key The property key.
 * @return {string} The property type, or null if the property is not defined.
 */
export function getPropertyType(node, key) {
  const prop = getProperty(node, key);
  return (prop && prop.type) || null;
}

/**
 * Retrieves the property value for a node property.
 * @param {object} node The AST node.
 * @param {string} key The property key.
 * @return {string} The property value, or null if the property is not defined.
 */
export function getPropertyValue(node, key) {
  return node?.properties?.[key]?.value;
}

/**
 * Test if a property with the given key is defined on a node.
 * @param {object} node The AST node.
 * @param {string} key The property key.
 * @return {boolean} True if the property is defined, else false.
 */
export function hasProperty(node, key) {
  return node.properties ? Object.hasOwn(node.properties, key) : false;
}

/**
 * Test if a node has one or more expression-typed properties.
 * @param {object} node The AST node.
 * @return {boolean} True if the node has an expression-typed property, else false.
 */
export function hasExpressionProperty(node) {
  for (const key of getPropertyKeys(node)) {
    if (getPropertyType(node, key) === EXPRESSION) {
      return true;
    }
  }
  return false;
}

/**
 * Retrieves a property of a node given its key.
 * @param {object} node The AST node.
 * @param {string} key The property key.
 * @return {object} The property data, or null if the property does not exist.
 */
export function getProperty(node, key) {
  return hasProperty(node, key) ? node.properties[key] : null;
}

/**
 * Set a property of a node.
 * @param {object} node The AST node.
 * @param {string} key The property key.
 * @param {object} data The property data, should
 *  be an object with type and value properties.
 * @return {object} The modfied AST node.
 */
export function setProperty(node, key, data) {
  (node.properties || (node.properties = {}))[key] = data;
  return node;
}

/**
 * Set a value-typed property of a node.
 * @param {object} node The AST node.
 * @param {string} key The property key.
 * @param {*} value The property value.
 * @return {object} The modfied AST node.
 */
export function setValueProperty(node, key, value) {
  return setProperty(node, key, { type: VALUE, value });
}

/**
 * Remove a property of a node.
 * @param {object} node The AST node.
 * @param {string} key The property key.
 * @return {object} The modified AST node.
 */
export function removeProperty(node, key) {
  if (hasProperty(node, key)) {
    // eslint-disable-next-line no-unused-vars
    const { [key]: remove, ...props } = node.properties;
    if (hasKeys(props)) {
      node.properties = props;
    } else {
      delete node.properties;
    }
  }
  return node;
}

// -- AST Classes ----

export function hasClass(node, className) {
  return getClasses(node).indexOf(className) >= 0;
}

export function getClasses(node) {
  if (getPropertyType(node, 'class') === VALUE) {
    return getPropertyValue(node, 'class').split(/\s+/);
  }
  return [];
}

export function removeClass(node, className) {
  if (getPropertyType(node, 'class') === VALUE) {
    const classes = getClasses(node)
      .filter(c => c !== className)
      .join(' ');
    if (classes) {
      setValueProperty(node, 'class', classes);
    } else {
      removeProperty(node, 'class');
    }
  }
}

export function addClass(node, className) {
  const cls = getClasses(node);
  if (cls.indexOf(className) < 0) {
    setValueProperty(node, 'class', [...cls, className].join(' '));
  }
}

// -- AST Node Children ----

/**
 * Retrieve the children nodes of a parent node.
 * This method returns a direct reference to an underlying child
 * array. Callers should take care not to modify the returned array.
 * @param {object} node The parent node.
 * @return {object[]} The children of the node, or an empty array if none.
 */
export function getChildren(node) {
  return node.children || [];
}

/**
 * Append one or more child nodes to a parent node.
 * @param {object} node The parent AST node.
 * @param {...(object|object[])} children The children AST nodes to append.
 * @return {object} A modified AST node.
 */
export function appendChildren(node, ...children) {
  node.children = (node.children || []).concat(children.flat());
  return node;
}

/**
 * Prepend one or more child nodes to a parent node.
 * @param {object} node The parent AST node.
 * @param {...(object|object[])} children The children AST nodes to prepend.
 * @return {object} A modified AST node.
 */
export function prependChildren(node, ...children) {
  node.children = children.flat().concat(node.children || []);
  return node;
}

/**
 * Remove a child node from a parent node.
 * @param {object} node The parent AST node.
 * @param {object} child The child AST node to remove.
 * @return {object} A modified AST node.
 */
export function removeChild(node, child) {
  if (node.children) {
    node.children = node.children.filter(n => n !== child);
  }
  return node;
}

/**
 * Replace a child node for a parent node with new content.
 * @param {object} node The parent AST node.
 * @param {object} child The child AST node to replace.
 * @param {...(object|object[])} insert The new child AST nodes to insert.
 * @return {object} A modified AST node.
 */
 export function replaceChild(node, child, insert) {
  if (node.children) {
    node.children = node.children
      .map(n => n === child ? insert : n)
      .flat();
  }
  return node;
}

// -- AST Traversal ----

/**
 * Perform a preorder depth-first traversal of the AST.
 * @param {object} node The AST node at which to begin the traversal.
 * @param {function} callack Callback function invoked for each visited node.
 */
export function cloneNode(node) {
  const clone = { ...node };
  if (clone.properties) {
    clone.properties = {};
    for (const key in node.properties) {
      clone.properties[key] = { ...node.properties[key] };
    }
  }
  if (clone.children) {
    clone.children = clone.children.map(child => cloneNode(child));
  }
  return clone;
}

/**
 * Perform a preorder depth-first traversal of the AST.
 * @param {object} node The AST node at which to begin the traversal.
 * @param {function} callack Callback function invoked for each visited node.
 */
export function visitNodes(node, callback) {
  visitHelper(node, null, callback);
}

function visitHelper(node, parent, callback) {
  callback(node, parent);
  getChildren(node).forEach(child => {
    visitHelper(child, node, callback);
  });
}

/**
 * Retrieve all nodes that match a given predicate function.
 * @param {object} node The AST node at which to begin searching.
 *  Only this node and its descendants are considered.
 * @param {function(object): boolean} predicate Filter function to test nodes.
 *  If the predicate returns true, the node is included in the result.
 * @returns {object[]} An array of AST nodes that match the predicate.
 */
export function queryNodes(node, predicate) {
  const nodes = [];

  visitNodes(node, n => {
    if (predicate(n)) {
      nodes.push(n);
    }
  });

  return nodes;
}

/**
 * Merge consecutive text nodes into a consolidated text node.
 * @param {object[]} nodes An array of AST nodes.
 * @returns {object[]} An array of AST nodes with merged text nodes.
 */
export function mergeTextNodes(nodes) {
  const output = [];
  let text = [];

  function merge() {
    if (text.length === 1) {
      output.push(text.pop());
    } else if (text.length > 1) {
      output.push(createTextNode(text.map(n => n.value).join('')));
      text = [];
    }
  }

  for (let i = 0; i < nodes.length; ++i) {
    const node = nodes[i];
    if (isTextNode(node)) {
      text.push(node);
    } else {
      merge();
      output.push(node);
    }
  }
  merge();

  return output;
}

export function extractText(ast) {
  if (ast == null) {
    return '';
  } else if (typeof ast === 'string') {
    return ast;
  } else if (isTextNode(ast)) {
    return ast.value;
  } else {
    const inner = getChildren(ast).map(node => extractText(node)).join('');
    return inner + (getNodeName(ast) === 'p' ? '\n\n' : '');
  }
}
