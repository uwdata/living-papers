import { DraggableText } from './draggable-text.js';

export class RangeText extends DraggableText {
  static get properties() {
    return {
      value: {type: Number},
      step: {type: Number},
      span: {type: Number},
      min: {type: Number},
      max: {type: Number},
      title: {type: String},
      prefix: {type: String},
      suffix: {type: String}
    };
  }

  constructor() {
    super();
    this.value = 0;
    this.step = 1;
    this.min = -1000;
    this.max = +1000;
  }

  currentIndex() {
    const { min, step, value } = this;
    const v = +value || 0;
    return Math.floor((v - min) / step);
  }

  updatedIndex(x1, x2, index) {
    const { step, span, min, max } = this;
    const di = Math.round((x2 - x1) / span);
    const mi = Math.floor((max - min) / step);
    return Math.max(Math.min(index + di, mi), 0);
  }

  getValue(index) {
    return this.min + this.step * index;
  }

  setValue(index) {
    this.value = this.getValue(index);
  }

  content() {
    if (typeof this.value !== 'number') {
      return this. value;
    } else {
      const digits = Math.max(0, Math.ceil(-Math.log10(this.step)));
      return this.value.toFixed(digits);
    }
  }
}
