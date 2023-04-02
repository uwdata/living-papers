import { html } from 'lit';
import { ArticleElement } from './article-element.js';

export class Tooltip extends ArticleElement {

  constructor() {
    super();
    this.visible = false;
    this.addEventListener('keydown', this.keyDown);
    this.addEventListener('mousedown', this.mouseDown);
  }

  mouseDownClose = (event) => {
    if (this.contains(event.target)) return;
    this.hide();
  }

  keyDownClose = (event) => {
    if (!isCloseKey(event.key)) return;
    this.hide();
  }

  keyDown(event) {
    if (!isOpenKey(event.key) || this.visible) return;
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

    // add the close tooltip events
    document.addEventListener('keydown', this.keyDownClose);
    document.addEventListener('mousedown', this.mouseDownClose);
  }

  renderWithTooltip(classes, body, tooltip) {
    const tip = html`<div class="tooltip">${tooltip}</div>`;
    return html`<span class=${classes} tabindex=0>${tip}${body}</span>`;
  }
}

const isOpenKey = (key, openKey = 'Enter') => key === openKey;

const isCloseKey = (key, closeKey = 'Escape') => key === closeKey;

function transformTooltip(spanBBox, ttip) {
  // set translate to zero to undo any prior settings
  ttip.style.transform = `translate(0, 0)`;
  const tipBBox = ttip.getBoundingClientRect();
  const tipWidth = tipBBox.width;
  const tipX = tipBBox.left;
  const spanX = spanBBox.left;
  const maxWidth = document.body.clientWidth - 16;

  // case 1: tooltip is wider than document, shift to the leftmost point
  // case 2: tooltip extends out of view, shift back until it fits
  // otherwise, shift to match left-most edge of span
  const dx = tipWidth > maxWidth ? -tipX
    : spanX + tipWidth > maxWidth ? maxWidth - (tipX + tipWidth)
    : spanX - tipX;

  // offset tooltip to 2 pixels below bottom of span
  const dy = spanBBox.bottom - tipBBox.top + 2;

  ttip.style.transform = `translate(${dx}px, ${dy}px)`;
}
