import { LitElement } from 'lit';
import { removeChildren } from './util/remove-children.js';

/**
 * Abstract base class for Living Papers custom elements.
 */
export class ArticleElement extends LitElement {
  createRenderRoot() {
    // do not use a shadow dom
    return this;
  }

  connectedCallback() {
    if (!this.__initchildnodes) {
      // detach initial child nodes upon first connection to the DOM
      this.__initchildnodes = true;
      this.initialChildNodes(Array.from(this.childNodes));
      removeChildren(this);
    }
    super.connectedCallback();
  }

  initialChildNodes(nodes) {
    // store initial child nodes for subsequent access
    this.__children = nodes;
  }
}
