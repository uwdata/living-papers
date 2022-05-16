import { html } from 'lit';
import { ArticleElement } from './article-element';

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const ERROR = 'error';

export class CellView extends ArticleElement {
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
  return html`<span class="error-block">${message}</span>`;
}
