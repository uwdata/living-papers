import { html } from 'lit';
import { Observer, PENDING, FULFILLED, ERROR } from '../runtime/observer';
import { ArticleElement } from './article-element';

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
    this.observer = new Observer((status, value) => {
      this.status = status;
      if (status !== PENDING) {
        this.value = value;
        this.dispatchEvent(new Event('change'));
      }
    });
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
