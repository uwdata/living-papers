export const VALUE = 'value';
export const EVENT = 'event';
export const EXPRESSION = 'expression';

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

export function parseProperties([id, classes, props], extraProps, extraClasses) {
  classes = [...(classes || []), ...(extraClasses || [])];
  return createProperties({
    id: id || undefined,
    class: classes.length ? classes.join(' ') : undefined,
    ...Object.fromEntries(props),
    ...extraProps
  });
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
 * Extract properties from an AST node.
 * @param {object} node The AST node.
 * @param {(k: string, p: object) => boolean} test A predicate function to test if
 *  a property should be extracted. Takes a key and property entry as arguments.
 * @returns {object} A new properties object with extracted properties.
 */
 export function extractProperties(node, test) {
  const props = {};
  for (const key of getPropertyKeys(node)) {
    const prop = getProperty(node, key);
    if (test(key, prop)) {
      props[key] = prop;
    }
  }
  return props;
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
 * Retrieves the value for a node property as a boolean. This method interprets
 * string values: if a property value is undefined, null, false, 0, an empty
 * string, or the string 'false' (ignoring case), the return value is false.
 * Otherwise, this method returns true.
 * @param {object} node The AST node.
 * @param {string} key The property key.
 * @return {boolean} The property value as an interpreted boolean.
 */
export function getPropertyBoolean(node, key) {
  const value = node?.properties?.[key]?.value;
  return !!value && String(value).toLowerCase() !== 'false';
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
 * Test if a node has one or more event-typed properties.
 * @param {object} node The AST node.
 * @return {boolean} True if the node has an event-typed property, else false.
 */
 export function hasEventProperty(node) {
  for (const key of getPropertyKeys(node)) {
    if (getPropertyType(node, key) === EVENT) {
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
