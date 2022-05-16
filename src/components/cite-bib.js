import { html } from 'lit';
import { ArticleElement } from './article-element.js';

export class CiteBib extends ArticleElement {
  render() {
    return html`<h1>References</h1>${this.__children}`;
  }
}
