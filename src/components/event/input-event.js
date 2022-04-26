export class InputEvent extends Event {
  constructor(value) {
    super('input');
    this.value = value;
  }
}
