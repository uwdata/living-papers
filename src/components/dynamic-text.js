import { LitElement, html, css } from 'lit';
import { InputEvent } from './event/input-event.js';

export class DynamicText extends LitElement {
  static get styles() {
    return css`
      :host {
        text-decoration: underline dashed #888;
        cursor: ew-resize;
      }
    `;
  }

  static get properties() {
    return {
      value: {type: Number},
      step: {type: Number},
      span: {type: Number},
      min: {type: Number},
      max: {type: Number},
      title: {type: String}
    };
  }

  constructor() {
    super();
    this.value = 0;
    this.step = 1;
    this.span = 1;
    this.min = -1000;
    this.max = +1000;
    this.title = 'Draggable text';
    this.addEventListener('click', e => e.stopPropagation());
    this.addEventListener('mousedown', e => this.onMouseDown(e));
  }

  onMouseDown(e) {
    e.stopImmediatePropagation();
    const mx = e.x;
    const mv = +this.value;

    const cursor = this.ownerDocument.body.style.cursor;
    this.ownerDocument.body.style.cursor = 'ew-resize';

    const select = this.style.MozUserSelect;
    this.style.MozUserSelect = 'none';

    const move = e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const { step, span, min, max } = this;
      const dx = step * Math.round((e.x - mx) / span);
      const value = Math.max(Math.min(mv + dx, max), min);
      if (this.value !== value) {
        this.value = value;
        this.dispatchEvent(new InputEvent(value));
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
    return html`<span title=${this.title}>${this.value}</span>`;
  }
}

window.customElements.define('dynamic-text', DynamicText);
