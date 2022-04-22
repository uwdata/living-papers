import {LitElement, html, css} from 'lit';
import {TexMath} from './tex-math.js';

export class TexEquation extends TexMath {

  static get properties() {
    return {
      type: {type: String},
      nonumber: {type: Boolean},
      code: {type: String},
      leqno: {type: Boolean},
      fleqn: {type: Boolean},
      minRuleThickness: {type: Number}
    };
  }

  constructor() {
    super();
    this.mode = 'display';
    this.type = 'align';
    this.nonumber = false;
  }

  willUpdate() {
    const cmd = this.type + (this.nonumber ? '*' : '');
    this.code = `\\begin{${cmd}}\n${this.code}\n\\end{${cmd}}`;
  }
}

window.customElements.define('tex-equation', TexEquation);
