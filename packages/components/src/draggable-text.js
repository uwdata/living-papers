import { html } from 'lit';
import { ArticleElement } from './article-element.js';

export class DraggableText extends ArticleElement {
  constructor() {
    super();
    this.span = 1;
    this.title = 'Draggable text';
    this.prefix = '';
    this.suffix = '';
    this.addEventListener('click', e => e.stopPropagation());
    this.addEventListener('mousedown', e => this.onMouseDown(e));
  }

  onMouseDown(e) {
    e.stopImmediatePropagation();
    const mx = e.x;
    const i0 = this.currentIndex();

    const cursor = this.ownerDocument.body.style.cursor;
    this.ownerDocument.body.style.cursor = 'ew-resize';

    const select = this.style.MozUserSelect;
    this.style.MozUserSelect = 'none';

    const move = e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const index = this.updatedIndex(mx, e.x, i0);
      if (index !== this.currentIndex()) {
        this.setValue(index);
        this.dispatchEvent(new CustomEvent('input'));
        this.requestUpdate();
      }
    };

    const up = e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.ownerDocument.body.style.cursor = cursor;
      this.style.MozUserSelect = select;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }

  render() {
    return html`<span class="draggable-text" title=${this.title}>${this.prefix}${this.content()}${this.suffix}</span>`;
  }
}
