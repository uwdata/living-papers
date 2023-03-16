import { html } from 'lit';
import { ArticleElement } from './article-element.js';


export class Tooltip extends ArticleElement{

    constructor(content) {
      super();
      this.content = content;
      this.addEventListener('keydown', this.keyDown);
      this.addEventListener('mousedown', this.show);
      this.addEventListener('focusout', this.focusOut);
  }

  focusOut(event) {
    if (!this.contains(event.relatedTarget)) {
      this.hide();
    }
  }

  //Pressing 'Enter' opens the tooltip and 'Escape' closes the tooltip
  keyDown(event) {
    if (event.key == 'Enter') {
      this.show();
    } else if (event.key == 'Escape') {
      this.hide();
    }
  }

  //Close/hide tooltip
  hide() {
    for (const child of this.querySelector('.tooltip').children) {
      child.style.display = 'none';
    }
  }

  //Open/show tooltip
  show() {
    for (const child of this.querySelector('.tooltip').children) {
      child.style.display = 'inline-block';
    }
  }


  render() {
      return html`<span class='tooltip' tabindex=0>${this.content}</span>`;
  }
}

customElements.define('my-tooltip', Tooltip)
