import { html } from 'lit';
import { ArticleElement } from './article-element.js';
import { UnsafeRuntime } from '../runtime/runtime-unsafe.js';

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const ERROR = 'error';

export class ObservableCell extends ArticleElement {
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

  initialChildNodes(nodes) {
    // attempt to extract code from first child
    if (!this.hasAttribute('code') && nodes.length) {
      const code = nodes[0].textContent;
      const cells = code.split(/\n\s*---+\s*\n/g);
      this.code = cells.pop();
      register(cells);
    }
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
  return html`<span class="error-block">${message}</span>`;
}

async function register(cells) {
  for (const cell of cells) {
    await UnsafeRuntime.instance().defineUnsafe(cell);
  }
}
