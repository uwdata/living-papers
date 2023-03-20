import { html } from 'lit';
import { ArticleElement } from './article-element.js';

export class Tooltip extends ArticleElement {

  constructor() {
    super();
    this.addEventListener('keydown', this.keyDown);
    this.addEventListener('mousedown', this.show);
    this.addEventListener('focusout', this.focusOut);
  }

  focusOut(event) {
    if (!this.contains(event.relatedTarget)) {
      this.hide();
    }
  }

  keyDown(event) {
    if (event.key == 'Enter') {
      this.show();
    } else if (event.key == 'Escape') {
      this.hide();
    }
  }

  hide() {
    this.querySelector('.tooltip').style.display = 'none';
  }

  show() {
    this.querySelector('.tooltip').style.display = 'inline-block';
  }

  renderWithTooltip(classes, body, tooltip) {
    // TODO: dynamic positioning
    const style = 'transform: translate(-1.5em, 1.4em);';
    const tip = html`<div class="tooltip" style=${style}>${tooltip}</div>`;
    return html`<span class=${classes} tabindex=0>${body}${tip}</span>`;
  }
}
