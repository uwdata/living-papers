import { LitElement, html } from 'lit';

export class CrossRef extends LitElement {
  static get properties() {
    return {
      type: {type: String},
      xref: {type: String},
      index: {type: Number},
      short: {type: Boolean},
    };
  }

  createRenderRoot() {
    return this;
  }

  render() {
    // TODO? title tooltip
    const { type, xref, index = '?', short } = this;
    const cls = `xref ${type}${!short ? ' full' : ''}`;
    return html`<a class=${cls} href=${`#${xref}`}>${index}</a>`;
  }
}
