export const META = 'meta';
export const TEXTNODE = 'textnode';
export const COMPONENT = 'component';

/**
 * Create a new text node.
 * @param {string} text The text content of the node.
 * @returns {object} A new AST node.
 */
export function createTextNode(text = '') {
	return {
		type: TEXTNODE,
		value: String(text)
	};
}

/**
 * Create a new AST node.
 * @param {string} type The node type.
 * @param {string} name The component name.
 * @param {object} [properties] The node properties.
 * @param {object[]} [children] An array of child AST nodes.
 * @returns {object} A new AST node.
 */
 export function createNode(type, name, properties, children) {
  const hasProps = properties && Object.keys(properties).length;
  const hasKids = children && children.length;
	return {
		type,
    name: name.toLowerCase(),
		properties: hasProps ? properties : undefined,
		children: hasKids ? children : undefined
	};
}

/**
 * Create a new meta node.
 * @param {string} name The node name.
 * @param {object} [properties] The node properties.
 * @param {object[]} [children] An array of child AST nodes.
 * @returns {object} A new AST node.
 */
 export function createMetaNode(name, properties, children) {
  return createNode(META, name, properties, children);
}

/**
 * Create a new component node.
 * @param {string} name The component name.
 * @param {object} [properties] The node properties.
 * @param {object[]} [children] An array of child AST nodes.
 * @returns {object} A new AST node.
 */
export function createComponentNode(name, properties, children) {
  return createNode(COMPONENT, name, properties, children);
}

/**
 * Test if a node is a meta type node.
 * @param {object} node The AST node
 * @returns {boolean} True if the node is a meta node, false otherwise.
 */
 export function isMetaNode(node) {
	return node.type === META;
}

/**
 * Test if a node is a text type node.
 * @param {object} node The AST node
 * @returns {boolean} True if the node is a text node, false otherwise.
 */
export function isTextNode(node) {
	return node.type === TEXTNODE;
}

/**
 * Test if a node is a component type node.
 * @param {object} node The AST node
 * @returns {boolean} True if the node is a component node, false otherwise.
 */
export function isComponentNode(node) {
	return node.type === COMPONENT;
}

/**
 * Test if a node coresponds to a custom component.
 * Custom components include a hypen in their name.
 * @param {object} node The AST node
 * @returns {boolean} True if the node is a custom component node, false otherwise.
 */
export function isCustomComponentNode(node) {
  return isComponentNode(node) && node.name?.includes('-');
}

/**
 * Return the node name.
 * @param {object} node The AST node
 * @returns {string} The node name or undefined if there is no name.
 */
export function getNodeName(node) {
  return node?.name;
}

/**
 * Perform a preorder depth-first traversal of the AST.
 * @param {object} node The AST node at which to begin the traversal.
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
