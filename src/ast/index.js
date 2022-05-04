const VALUE = 'value';
const EVENT = 'event';
const EXPRESSION = 'expression';

// -- AST Nodes ----

export function createTextNode(text = '') {
	return {
		type: 'textnode',
		value: String(text)
	};
}

export function createComponentNode(name, properties, children) {
  const hasProps = properties && Object.keys(properties).length;
  const hasKids = children && children.length;
	return {
		type: 'component',
    name: name.toLowerCase(),
		properties: hasProps ? properties : undefined,
		children: hasKids ? children : undefined
	};
}

export function isTextNode(ast) {
	return ast.type === 'textnode';
}

export function isComponentNode(ast) {
	return ast.type === 'component';
}

export function getNodeName(node) {
  return node?.name;
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
  return node.properties?.hasOwnProperty(key) || false;
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
    const { [key]: remove, ...props } = node.properties;
    if (hasKeys(props)) {
      node.properties = props;
    } else {
      delete node.properties;
    }
  }
  return node;
}

// -- AST Node Children ----

/**
 * Retrieve the children nodes of a parent node.
 * This method returns a direct reference to an underlying child
 * array. Callers should take care not to modify the returned array.
 * @param {object} node The parent node.
 * @return {object[]} The children of the node, or an empty array if none.
 */
export function getChildren(ast) {
  return ast.children || [];
}

/**
 * Append one or more child nodes to a parent node.
 * @param {object} node The parent AST node.
 * @param {...(object|object[])} children The children AST nodes to append.
 * @return {object} A modified AST node.
 */
export function appendChildren(ast, ...children) {
  ast.children = (ast.children || []).concat(children.flat());
  return ast;
}

/**
 * Prepend one or more child nodes to a parent node.
 * @param {object} node The parent AST node.
 * @param {...(object|object[])} children The children AST nodes to prepend.
 * @return {object} A modified AST node.
 */
export function prependChildren(ast, ...children) {
  ast.children = children.flat().concat(ast.children || []);
  return ast;
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
    clone.properties = { ...clone.properties };
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
  callback(node);
  getChildren(node).forEach(node => visitNodes(node, callback));
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
