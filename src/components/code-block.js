import { DependentElement } from './dependent-element.js';
import { clearChildren } from '../util/clear-children.js';

export class CodeBlock extends DependentElement {

  static get dependencies() {
    return [
      {
        name: '@uwdata/highlightjs',
        version: '0.0.1',
        main: 'dist/highlight.min.js',
        css: 'dist/styles/github.css'
      }
    ]
  };

  static get properties() {
    return {
      code: {type: String},
      inline: {type: Boolean},
      language: {type: String}
    };
  }

  constructor() {
    super();
    this.inline = false;
    this.language = null;
  }

  createRenderRoot() {
    // no shadow dom, let global CSS apply
    return this;
  }

  connectedCallback() {
    // attempt to extract code from first child
    if (!this.hasAttribute('code') && this.childNodes.length) {
      this.code = this.childNodes[0].textContent.trim();
      clearChildren(this);
    }
    super.connectedCallback();
  }

  render() {
    const hljs = this.getDependency('@uwdata/highlightjs');
    if (!hljs || !this.code) return;

    const { language, inline } = this;
    const root = document.createElement(inline ? 'code' : 'pre');
    language
      ? (root.innerHTML = hljs.highlight(this.code, { language }).value)
      : (root.innerText = this.code);
    return root;
  }
}
