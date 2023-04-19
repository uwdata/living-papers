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
    this.step = 1;
    this.min = -1000;
    this.max = +1000;
    this.value = NaN;
  }

  currentIndex() {
    const { min, step, value } = this;
    return isNaN(value) ? 0 : Math.floor((+value - min) / step);
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
      return this.value;
    } else {
      const digits = Math.max(0, Math.ceil(-Math.log10(this.step)));
      const value = Number.isNaN(this.value) ? this.min : this.value;
      return value.toFixed(digits);
    }
  }
}
