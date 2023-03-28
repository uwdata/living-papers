import { html } from 'lit';
import { ArticleElement } from './article-element.js';

export class Tooltip extends ArticleElement {

  constructor() {
    super();
    this.visible = false;
    this.addEventListener('keydown', this.keyDown);
    this.addEventListener('mousedown', this.mouseDown);
  }

  keyDown(event) {
    if (event.key !== 'Enter' || this.visible) return;

    this.show();
  }

  mouseDown() {
    if (this.visible) return;

    this.show();
  }

  hide() {
    this.querySelector('.tooltip').style.display = 'none';
    this.visible = false;

    // clean up event listeners
    document.removeEventListener('keydown', this.keyDownClose);
    document.removeEventListener('mousedown', this.mouseDownClose);
  }

  show() {
    const bbox = this.getBoundingClientRect();
    const ttip = this.querySelector('.tooltip');
    ttip.style.transform = `translate(${bbox.left - bbox.width < 0 ? 0 : -bbox.width}px, calc(1em + 6px))`;
    ttip.style.display = 'inline-block';
    this.visible = true;

    // check if the user has clicked outside of the parent element
    const mouseDownClose = (event) => {
      if (!this.contains(event.target)) this.hide();
    }
    this.mouseDownClose = mouseDownClose;

    const keyDownClose = (event) => {
      if (event.key == 'Escape') this.hide();
    }
    this.keyDownClose = keyDownClose;

    // add the close tooltip events
    document.addEventListener('keydown', this.keyDownClose);
    document.addEventListener('mousedown', this.mouseDownClose);
  }

  renderWithTooltip(classes, body, tooltip) {
    const tip = html`<div class="tooltip">${tooltip}</div>`;
    return html`<span class=${classes} tabindex=0>${body}${tip}</span>`;
  }
}
