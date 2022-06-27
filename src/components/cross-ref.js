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

  goto(event) {
    // prevent jump to referenced element
    event.preventDefault();

    // add id to hash component of current URL
    // do not change the page undo history
    const id =`#${this.xref}`;
    history.replaceState(null, null, id);

    // smoothly scroll to referenced component
    document.querySelector(id)
      .scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  render() {
    // TODO? title tooltip
    const { type, xref, index, short } = this;
    const resolved = index != null;
    const cls = `cross-ref ${type}${!short ? ' full' : ''}`;
    if (resolved) {
      return html`<a class=${cls} href="#${xref}" @click=${this.goto}>${index}</a>`;
    } else {
      return html`<a class="${cls} unresolved" title="Unresolved reference: ${xref}">?</a>`;
    }
  }
}
