import katex from 'katex';
import { LitElement } from 'lit';
import { clearChildren } from '../util/clear-children.js';
import { injectStyle } from '../util/inject-style.js';

export class TexMath extends LitElement {

  static get properties() {
    return {
      mode: {type: String},
      code: {type: String},
      leqno: {type: Boolean},
      fleqn: {type: Boolean},
      minRuleThickness: {type: Number}
    };
  }

  constructor() {
    super();
    this.mode = 'inline';
    this.leqno = false;
    this.fleqn = true;
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    // attempt to extract code from first child
    if (!this.hasAttribute('code') && this.childNodes.length) {
      this.code = this.childNodes[0].textContent;
      clearChildren(this);
    }

    injectStyle(this.ownerDocument, 'tex-math', TexMath.CSS);

    super.connectedCallback();
  }

  render() {
    if (!this.code) return;

    // See https://katex.org/docs/options.html
    const displayMode = this.mode === 'display';
    const options = {
      throwOnError: false,
      displayMode,
      leqno: this.leqno,
      fleqn: this.fleqn,
      minRuleThickness: this.minRuleThickness
    };

    const root = document.createElement(displayMode ? 'div' : 'span');
    katex.render(this.code, root, options);
    return root;
  }
}

TexMath.CSS = 'https://cdn.jsdelivr.net/npm/katex@0.15.3/dist/katex.min.css';

window.customElements.define('tex-math', TexMath);
