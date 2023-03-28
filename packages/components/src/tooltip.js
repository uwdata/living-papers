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
    const ttip = this.querySelector('.tooltip');
    ttip.style.display = 'inline-block';
    this.visible = true;
    transformTooltip(this.getBoundingClientRect().height, ttip);

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
    return html`<span class=${classes} tabindex=0>${tip}${body}</span>`;
  }
}

function transformTooltip(boxHeight, ttip) {
  ttip.style.transform = `translate(0, 0)`;
  const ttbb = ttip.getBoundingClientRect();
  const docWidthWithRightPad = document.body.clientWidth - 16;

  // case 1: tooltip is wider than document, shift to the leftmost point
  // case 2: tooltip extends out of view, shift it back that amount
  // otherwise, do not shift
  const translateX = ttbb.width > docWidthWithRightPad
    ? -ttbb.left
    : ttbb.right > docWidthWithRightPad
    ? docWidthWithRightPad - ttbb.right : 0;

  ttip.style.transform = `translate(${translateX}px, ${boxHeight + 4}px)`;
}
