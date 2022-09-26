import { html } from 'lit';
import { ArticleElement } from './article-element.js';

let numNotes = 0; // incrementing counter of notes

export class InlineNote extends ArticleElement {
  constructor() {
    super();
    this.number = ++numNotes;
  }

  render() {
    const num = this.number;
    return html`<span class="inline-note"><sup class="inline-note-number">${num}</sup><span class="note margin" data-number="${num}">${this.__children}</span></span>`;
  }
}
