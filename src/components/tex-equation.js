import { TexMath } from './tex-math.js';

export class TexEquation extends TexMath {

  static get properties() {
    return {
      type: {type: String},
      nonumber: {type: Boolean}
    };
  }

  constructor() {
    super();
    this.mode = 'display';
    this.type = 'align';
    this.nonumber = false;
  }

  prepareMath() {
    const cmd = this.type + (this.nonumber ? '*' : '');
    return `\\begin{${cmd}}\n${this.code}\n\\end{${cmd}}`;
  }
}
