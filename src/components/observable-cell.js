import {LitElement, html, css} from 'lit';
import {ObservableRuntime} from '../observable/runtime.js';
import {PENDING, FULFILLED, ERROR} from '../observable/status.js';

export class ObservableCell extends LitElement {
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
      hide: {type: Boolean},
      status: {type: String, state: true},
      code: {type: String}
    };
  }

  constructor() {
    super();
    this.status = PENDING;
    this.value = 'Loading...';

    this.observer = {
      pending: () => {
        // this.status = PENDING;
      },
      fulfilled: (value, name) => {
        this.status = FULFILLED;
        this.value = value;
      },
      rejected: (error, name) => {
        this.status = ERROR;
        this.value = { error, name };
      }
    };
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    // attempt to extract code from first child
    if (!this.hasAttribute('code') && this.childNodes.length) {
      const code = this.childNodes[0].textContent;
      this.innerHTML = '';
      const cells = code.split(/\n\s*---+\s*\n/g);
      this.code = cells.pop();
      register(cells);
    }

    super.connectedCallback();
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('code')) {
      ObservableRuntime.instance().define(this.code, this.observer);
    }
  }

  render() {
    if (this.hide || !this.code) {
      return;
    }
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

async function register(cells) {
  for (const cell of cells) {
    await ObservableRuntime.instance().define(cell);
  }
}

window.customElements.define('obs-cell', ObservableCell);
