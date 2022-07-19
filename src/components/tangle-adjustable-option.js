import { html } from 'lit';
import { ArticleElement } from './article-element.js';

export class TangleAdjustableOption extends ArticleElement {
  static get properties() {
    return {
      values: {type: Array},
      value: {type: String},
      index: {type: Number},
      span: {type: Number},
      display: {
        converter: {
          fromAttribute: (value, type) => new Function(`return ${value};`)(),
          toAttribute: (value, type) => value.toString(),
        },
      },
      title: {type: String},
    };
  }

  constructor() {
    super();
    this.values = [""];
    this.index = 0;
    this.value = null;
    this.span = 1;
    this.display = (x) => x;
    this.title = 'Draggable text';
    this.addEventListener('click', e => e.stopPropagation());
    this.addEventListener('mousedown', e => this.onMouseDown(e));
  }

  onMouseDown(e) {
    e.stopImmediatePropagation();
    const mx = e.x;
    const mv = this.index;

    const cursor = this.ownerDocument.body.style.cursor;
    this.ownerDocument.body.style.cursor = 'ew-resize';

    const select = this.style.MozUserSelect;
    this.style.MozUserSelect = 'none';

    const move = e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const dx = Math.round((e.x - mx) / this.span);
      const index = Math.max(Math.min(mv + dx, this.values.length - 1), 0);
      if (this.index !== index) {
        this.index = index;
        this.value = this.values[this.index];
        this.dispatchEvent(new Event('input'));
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
    const value = this.value || this.values[this.index];
    return html`<span class="range-text" title=${this.title}>${this.display(value)}</span>`;
  }
}
