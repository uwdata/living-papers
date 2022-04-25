import { LitElement, html, css } from 'lit';
import { ObservableRuntime } from '../observable/runtime.js';
import { PENDING, FULFILLED, ERROR } from '../observable/status.js';

/**
 * Work-in-progess test to connect to an existing named Observable
 * cell, inject a new observer, and display the result.
 */
export class NamedCell extends LitElement {
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
      status: {type: String, state: true},
      hide: {type: Boolean},
      name: {type: String}
    };
  }

  constructor() {
    super();
    this.status = PENDING;
    this.value = '';
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    // attempt to connect on the next tick
    // this lets the runtime initialize first
    setTimeout(() => this.observe());
    super.connectedCallback();
  }

  async observe() {
    const { main } = ObservableRuntime.instance();

    // Get a Promise for the current variable value
    // This ensures the variable is evaluated prior to changes below!
    this.value = await main.value(this.name);

    // (!!) BREAKS ENCAPUSULATION
    // access Observable's internal namespace map
    const v = main._scope.get(this.name);

    // (!!) BREAKS ENCAPUSULATION
    // patch the internal observer for the variable
    v._observer = {
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

  render() {
    if (this.hide) {
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

window.customElements.define('named-cell', NamedCell);
