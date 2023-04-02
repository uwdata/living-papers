import { DraggableText } from './draggable-text.js';

export class OptionText extends DraggableText {
  static get properties() {
    return {
      value: {attribute: false},
      options: {type: Array},
      span: {type: Number},
      title: {type: String},
      prefix: {type: String},
      suffix: {type: String}
    };
  }

  constructor() {
    super();
    this.value = undefined;
    this.index = 0;
    this.options = [];
  }

  currentIndex() {
    return this.index;
  }

  updatedIndex(x1, x2, i0) {
    const { span, options } = this;
    const di = Math.round((x2 - x1) / span);
    return Math.max(Math.min(i0 + di, options.length - 1), 0);
  }

  getIndex(value) {
    return Math.max(0, this.options.indexOf(value));
  }

  getValue(index) {
    const { options } = this;
    return options[index];
  }

  setValue(index) {
    this.index = index;
    this.value = this.getValue(index);
  }

  content() {
    this.index = this.getIndex(this.value);
    return this.value ?? this.options[this.index];
  }
}
