import { DependentElement } from '@living-papers/components';
import perf_data from './data-performance.js';

export default class VegaPlot extends DependentElement {
  static get dependencies() {
    return [
      {
        name: 'vega',
        version: '5',
        main: 'build/vega.min.js'
      }
    ]
  }

  static get properties() {
    return {
      value: {type: Number}
    };
  }

  constructor(spec) {
    super();
    this._spec = spec;
    this.value = 1;
  }

  render() {
    const vega = this.getDependency('vega');
    if (!vega) return;

    if (!this._root) {
      // initialize component
      this._root = document.createElement('div');
      this._root.style['margin-left'] = '-35px';
      this._root.style['padding'] = '1em 0';
      this._view = new vega.View(vega.parse(this._spec))
        .renderer('svg')
        .logLevel(vega.Warn)
        .initialize(this._root)
        .insert('perf', perf_data);

      // propagate selected theta
      this._view.addSignalListener('theta', (name, value) => {
        if (value != this.value) {
          this.value = value;
          this.dispatchEvent(new Event('input'));
        }
      });
    }

    // set chart theta value
    this._view.signal('theta', this.value).run();
    return this._root;
  }
}
