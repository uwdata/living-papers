import { LitElement, html } from 'lit';

export class CiteBib extends LitElement {
  render() {
    return html`<h1>References</h1><slot></slot>`;
  }
}
