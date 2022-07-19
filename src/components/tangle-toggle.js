import { html } from 'lit';
import { ArticleElement } from './article-element.js';

export class TangleToggle extends ArticleElement {
  static get properties() {
    return {
      values: {type: Array},
      value: {type: Boolean},
      title: {type: String},
    };
  }

  constructor() {
    super();
    this.value = true;
    this.values = ["True", "False"];
    this.title = 'Clickable text';
    this.addEventListener('click', e => this.onClick(e));
  }

  onClick(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
    this.value = !this.value;
    this.dispatchEvent(new Event('input'));
    this.requestUpdate();
  }

  render() {
    const value = this.values[this.value ? 0 : 1]; // first element is True
    return html`<span class="tangle-toggle" title=${this.title}>${value}</span>`;
  }
}
