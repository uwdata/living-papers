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
    ttip.style.display = 'inline-block';
    this.visible = true;
    transformTooltip(bbox, ttip);

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

function transformTooltip(bbox, ttip) {
  ttip.style.transform = `translate(0, 0)`;
  const ttbb = ttip.getBoundingClientRect();
  const hasMultiLineBody =  bbox.width > ttbb.left;
  const docWidthWithRightPad = document.body.clientWidth - 16;
  const translateY = (hasMultiLineBody ? bbox.height/2 : bbox.height) + 4;

  // case 1: tooltip is wider than document, shift to the leftmost point
  // case 2: tooltip extends out of view, shift it back that amount
  // case 3: tooltip wraps lines, shift it to leftmost point of tooltip body
  // otherwise, shift it back the width of tooltip body
  const translateX = ttbb.width > docWidthWithRightPad
    ? -ttbb.left
    : ttbb.right > docWidthWithRightPad
    ? docWidthWithRightPad - ttbb.right
    : hasMultiLineBody
    ? bbox.left - ttbb.left : -bbox.width;

  ttip.style.transform = `translate(${translateX}px, ${translateY}px)`;
}
