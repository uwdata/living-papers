import { LitElement, html, css } from 'lit';

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
      max: {type: Number}
    };
  }

  constructor() {
    super();
    this.value = 0;
    this.step = 1;
    this.span = 1;
    this.min = -1000;
    this.max = +1000;
  }

  render() {
    return html`<span>${this.value}</span>`;
  }

  firstUpdated() {
    this.renderRoot.addEventListener('mousedown', e => {
      e.stopImmediatePropagation();
      const mx = e.x;
      const mv = this.value;
      const cursor = this.ownerDocument.body.style.cursor;
      this.ownerDocument.body.style.cursor = 'ew-resize';
      const move = e => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const { step, span, min, max } = this;
        const dx = step * Math.round((e.x - mx) / span);
        const value = Math.max(Math.min(mv + dx, max), min);
        this.value = value;
        this.dispatchEvent(new ValueEvent(value));
        this.requestUpdate();
      };
      const up = e => {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.ownerDocument.body.style.cursor = cursor;
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    });
  }
}

class ValueEvent extends Event {
  constructor(value) {
    super('value');
    this.value = value;
  }
}

window.customElements.define('dynamic-text', DynamicText);
