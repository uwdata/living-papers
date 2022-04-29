import { LitElement, html, css } from 'lit';

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const ERROR = 'error';

export class CellView extends LitElement {
  static get styles() {
    return css`
      .error {
        display: block;
        border: solid 1px red;
        padding: 1em;
        max-width: 800px;
      }
    `;
  }

  static get properties() {
    return {
      value: {state: true},
      status: {type: String, state: true}
    };
  }

  constructor() {
    super();
    this.status = PENDING;
    this.value = undefined;
    this.observer = {
      fulfilled: (value) => {
        this.status = FULFILLED;
        this.value = value;
        this.dispatchEvent(new Event('change'));
      },
      rejected: (error, name) => {
        this.status = ERROR;
        this.value = { error, name };
        this.dispatchEvent(new Event('change'));
      }
    };
  }

  createRenderRoot() {
    return this;
  }

  render() {
    switch (this.status) {
      case PENDING:
      case FULFILLED:
        return this.value;
      case ERROR:
        return error(this.value.error);
      default:
        return error(`Unrecognized status: ${this.status}.`);
    }
  }
}

function error(message) {
  return html`<span class="error">${message}</span>`;
}

window.customElements.define('cell-view', CellView);
