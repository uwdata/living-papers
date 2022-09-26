import { LitElement } from 'lit';
import { removeChildren } from './util/remove-children.js';

export class ArticleElement extends LitElement {
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    if (!this.__initchildnodes) {
      this.__initchildnodes = true;
      this.initialChildNodes(Array.from(this.childNodes));
      removeChildren(this);
    }
    super.connectedCallback();
  }

  initialChildNodes(nodes) {
    this.__children = nodes;
  }
}
