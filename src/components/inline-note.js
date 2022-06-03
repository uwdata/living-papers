import { html } from 'lit';
import { ArticleElement } from './article-element.js';

let numNotes = 0; // incrementing counter of notes

export class InlineNote extends ArticleElement {
  render() {
    let noteNumber = ++numNotes;
    return html`
    <span class="inlinenote">
        <sup class="inlinenote-number">[${noteNumber}]</sup>
        <span class="note margin" data-number="${noteNumber}">${this.__children}</span>
    </span>`;
  }
}
