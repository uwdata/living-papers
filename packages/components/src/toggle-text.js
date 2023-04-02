import { html } from 'lit';
import { ArticleElement } from './article-element.js';

export class ToggleText extends ArticleElement {
  static get properties() {
    return {
      value: {type: Boolean},
      title: {type: String},
      clickable: {type: Boolean, converter: v => v && v !== 'false'}
    };
  }

  constructor() {
    super();
    this.value = true;
    this.clickable = true;
    this.title = 'Clickable text';
    this.addEventListener('mousedown', e => this.onClick(e));
  }

  initialChildNodes(nodes) {
    this.options = nodes.filter(node => node.nodeType === 1);
  }

  onClick(event) {
    if (!this.clickable) return;
    event.stopImmediatePropagation();
    event.preventDefault();
    this.value = !this.value;
    this.dispatchEvent(new Event('input'));
    this.requestUpdate();
  }

  render() {
    const title = this.clickable ? this.title : null;
    const cls = this.clickable ? 'toggle-text' : null;
    const opt = this.options[this.value ? 0 : 1]; // first element is true
    return html`<span class=${cls} title=${title}>${opt}</span>`;
  }
}
