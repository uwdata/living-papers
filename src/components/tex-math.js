import { DependentElement } from './dependent-element.js';

export class TexMath extends DependentElement {
  static get dependencies() {
    return [
      {
        name: 'katex',
        version: '0.15.3',
        module: 'dist/katex.mjs',
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
      fleqn: {type: Boolean, converter: v => v !== 'false'},
      minRuleThickness: {type: Number}
    };
  }

  constructor() {
    super();
    this.mode = 'display';
    this.leqno = false;
    this.fleqn = true;
  }

  initialChildNodes(nodes) {
    // attempt to extract code from first child
    if (!this.hasAttribute('code') && nodes.length) {
      this.code = nodes[0].textContent;
    }
  }

  prepareMath() {
    return this.code;
  }

  render() {
    const katex = this.getDependency('katex');
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
