import {LitElement, html, css} from 'lit';
import katex from 'katex';

export class TexMath extends LitElement {
  // static get styles() {
  //   return css`
  //     @import "http://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.15.3/katex.min.css";
  //   `;
  // }

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
      this.innerHTML = '';
    }
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

window.customElements.define('tex-math', TexMath);
