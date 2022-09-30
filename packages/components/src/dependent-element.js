import { ArticleElement } from './article-element.js';
import { getDependency, hasDependencies, loadDependencies } from './util/dependencies.js';

/**
 * Abstract base class for Living Papers custom elements
 * with dependencies loaded from a CDN upon page load.
 * Implementations must define a static `dependencies` getter
 * that returns a list of dependency definitions.
 */
export class DependentElement extends ArticleElement {
  getDependency(name) {
    // proxy calls to the getDependency helper
    return getDependency(this, name);
  }

  shouldUpdate() {
    // check if dependencies are loaded and available
    // if not, load and request update once ready
    return hasDependencies(this) ? true
      : (loadDependencies(this).then(() => { this.requestUpdate() }), false);
  }
}
