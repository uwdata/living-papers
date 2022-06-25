export const PENDING = 'pending';
export const FULFILLED = 'fulfilled';
export const ERROR = 'error';

export class Observer {
  constructor(callback) {
    this.status = PENDING;
    this.value = undefined;
    this.callback = callback;
  }

  promise() {
    switch (this.status) {
      case FULFILLED:
        return Promise.resolve(this.value);
      case ERROR:
        return Promise.reject(this.value.error);
      case PENDING:
        return this._promise || (this._promise = new Promise((resolve, reject) => {
          this._resolve = resolve;
          this._reject = reject;
        }));
    }
  }

  update(status, value) {
    this.status = status;
    if (status !== PENDING) this.value = value;
    this.callback(this.status, this.value);
  }

  pending() {
    this.update(PENDING, undefined);
  }

  fulfilled(value) {
    this.update(FULFILLED, value);
    if (this._promise) {
      this._resolve(value);
      this._promise = this._resolve = this._reject = null;
    }
  }

  rejected(error, name) {
    this.update(ERROR, { error, name });
    if (this._promise) {
      this._reject(error);
      this._promise = this._resolve = this._reject = null;
    }
  }
}
