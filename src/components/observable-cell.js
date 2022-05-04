import { LitElement, html, css } from 'lit';
import { UnsafeRuntime } from '../runtime/runtime-unsafe.js';
import { clearChildren } from '../util/clear-children.js';

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const ERROR = 'error';

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
    this.value = '';

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

  connectedCallback() {
    // attempt to extract code from first child
    if (!this.hasAttribute('code') && this.childNodes.length) {
      const code = this.childNodes[0].textContent;
      clearChildren(this);
      const cells = code.split(/\n\s*---+\s*\n/g);
      this.code = cells.pop();
      register(cells);
    }

    super.connectedCallback();
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('code')) {
      UnsafeRuntime.instance().defineUnsafe(this.code, this.observer);
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
    await UnsafeRuntime.instance().defineUnsafe(cell);
  }
}
