import { LitElement, html } from 'lit';

export class CiteList extends LitElement {
  static get properties() {
    return {
      start: {type: String},
      end: {type: String},
      sep: {type: String}
    };
  }

  constructor() {
    super();
    this.start = '[';
    this.end = ']';
    this.sep = ', ';
  }

  render() {
    const { childNodes, start, end, sep } = this;
    const list = Array.from(childNodes, (n, i) => i > 0 ? [sep, n] : n);
    return html`${start}${list}${end}`;
  }
}
