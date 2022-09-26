import { DependentElement } from './dependent-element.js';

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

  initialChildNodes(nodes) {
    // attempt to extract code from first child
    if (!this.hasAttribute('code') && nodes.length) {
      this.code = nodes[0].textContent.trim();
    }
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
