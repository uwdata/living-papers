import { html } from 'lit';
import { ArticleElement } from './article-element.js';

export class Tooltip extends ArticleElement {

  constructor() {
    super();
    this.visible = false;
    this.addEventListener('keydown', this.keyDown);
    this.addEventListener('mousedown', this.mouseDown);
    this.addEventListener('focusout', this.focusOut);
  }

  mouseDown() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
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
    this.visible = false;
  }

  show() {
    const bbox = this.getBoundingClientRect();
    const ttip = this.querySelector('.tooltip');
    ttip.style.transform = `translate(-${bbox.width}px, ${4 + bbox.height}px)`;
    ttip.style.display = 'inline-block';
    this.visible = true;
  }

  renderWithTooltip(classes, body, tooltip) {
    const tip = html`<div class="tooltip">${tooltip}</div>`;
    return html`<span class=${classes} tabindex=0>${body}${tip}</span>`;
  }
}
