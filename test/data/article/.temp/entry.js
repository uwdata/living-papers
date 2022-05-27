import { CellView } from '/Users/mpconlen/projects/living-papers-testbed/src/components/cell-view.js';
import { TexMath } from '/Users/mpconlen/projects/living-papers-testbed/src/components/tex-math.js';

import { ObservableRuntime } from '/Users/mpconlen/projects/living-papers-testbed/src/runtime/runtime.js';
import { UnsafeRuntime } from '/Users/mpconlen/projects/living-papers-testbed/src/runtime/runtime-unsafe.js';
import { hydrate } from '/Users/mpconlen/projects/living-papers-testbed/src/build/hydrate.js';
import * as module from './runtime.js';
window.customElements.define('cell-view', CellView);
window.customElements.define('tex-math', TexMath);
window.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('article');
  window.runtime = UnsafeRuntime.instance(); hydrate(window.runtime, root, module, {"_id":2,"attrs":[["2","code",0]],"events":[["1","click",0]]});
});