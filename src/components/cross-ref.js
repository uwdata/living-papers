import { html } from 'lit';
import { ArticleElement } from './article-element';

export class CrossRef extends ArticleElement {
  static get properties() {
    return {
      type: {type: String},
      xref: {type: String},
      index: {type: Number},
      short: {type: Boolean},
    };
  }

  render() {
    // TODO? title tooltip
    const { type, xref, index = '?', short } = this;
    const cls = `cross-ref ${type}${!short ? ' full' : ''}`;
    return html`<a class=${cls} href=${`#${xref}`}>${index}</a>`;
  }
}
