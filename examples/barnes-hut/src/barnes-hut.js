import { DependentElement } from '@living-papers/components';
import quadtree from './quadtree.js';

export default class BarnesHut extends DependentElement {
  static get dependencies() {
    return [
      {
        name: 'd3',
        version: '4',
        main: 'build/d3.min.js'
      }
    ]
  }

  static get properties() {
    return {
      width: {type: Number},
      height: {type: Number},
      size: {type: Number},
      theta: {type: Number},
      charge: {type: Number},
      radius: {type: Number},
      accumulate: {type: Number},
      layout: {type: Boolean, converter: v => v !== 'false'},
      estimate: {type: Boolean, converter: v => v !== 'false'}
    };
  }

  constructor() {
    super();
    this.width = 514;
    this.height = 514;
    this.size = 0;
    this.theta = 0;
    this.charge = -30;
    this.radius = 4;
    this.accumulate = false;
    this.layout = true;
    this.estimate = false;
  }

  willUpdate(changedProperties) {
    if (this._sim) {
      changedProperties.forEach((_, key) => {
        this._sim[key](this[key]);
      });
    }
  }

  render() {
    const d3 = this.getDependency('d3');
    if (!d3) return;

    if (!this._root) {
      // initialize component
      this._root = document.createElement('div');
      this._root.setAttribute('class', 'quad');
      this._sim = quadtree(d3, this._root, {
        width:  this.width,
        height: this.height,
        theta:  this.theta,
        radius: this.radius,
      });
    }

    return this._root;
  }
}
