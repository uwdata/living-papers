import { ArticleElement } from '../../../../src/components/article-element';
import { html } from 'lit';

export default class ActiveKey extends ArticleElement {
  static get properties() {
    return {
      key: {type: String},
      start: {type: Number},
      end: {type: Number},
      value: {type: Number}
    };
  }

  constructor() {
    super();
    window.addEventListener('keydown', e => this.onKeyDown(e));
  }

  onKeyDown(e) {
    if (e.key == this.key.toLowerCase()) {
      this.value = Math.floor(Math.random() * (this.end - this.start + 1)) + this.start;
      this.dispatchEvent(new Event('input'));
    }
  }

  render() {
    return html`<i class='active-key'>"${this.key}"</i>`;
  }
}
