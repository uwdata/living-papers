import { LitElement } from 'lit';
import { clearChildren } from '../util/clear-children.js';
import { getDependency, hasDependencies, loadDependencies } from '../util/dependencies.js';

export class TexMath extends LitElement {

  static get dependencies() {
    return [
      {
        name: 'katex',
        version: '0.15.3',
        main: 'dist/katex.min.js',
        css: 'dist/katex.min.css'
      }
    ]
  };

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
    // no shadow dom, let global CSS apply
    return this;
  }

  connectedCallback() {
    // attempt to extract code from first child
    if (!this.hasAttribute('code') && this.childNodes.length) {
      this.code = this.childNodes[0].textContent;
      clearChildren(this);
    }
    super.connectedCallback();
  }

  prepareMath() {
    return this.code;
  }

  shouldUpdate() {
    // check if dependencies are loaded and available
    // if not, load and request update once ready
    return hasDependencies(this) ? true
      : (loadDependencies(this).then(() => { this.requestUpdate() }), false);
  }

  render() {
    const katex = getDependency(this, 'katex');
    if (!katex || !this.code) return;

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
    katex.render(this.prepareMath(), root, options);
    return root;
  }
}

window.customElements.define('tex-math', TexMath);
