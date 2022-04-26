import { LitElement } from 'lit';
import { getDependency, hasDependencies, loadDependencies } from '../util/dependencies.js';

export class DependentElement extends LitElement {
  getDependency(name) {
    return getDependency(this, name);
  }

  shouldUpdate() {
    // check if dependencies are loaded and available
    // if not, load and request update once ready
    return hasDependencies(this) ? true
      : (loadDependencies(this).then(() => { this.requestUpdate() }), false);
  }
}
