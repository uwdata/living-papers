import { html } from 'lit';
import { Tooltip } from './tooltip';

export class CrossRef extends Tooltip {
  static get properties() {
    return {
      type: {type: String},
      xref: {type: String},
      index: {type: Number},
      short: {type: Boolean},
    };
  }

  show() {
    if (this.index != null) {
      this.renderTooltipContent(document.getElementById(this.xref));
    }

    this.querySelector('.tooltip').style.display = 'inline-block';
  }

  goto(event) {
    // prevent jump to referenced element
    event.preventDefault();

    // add id to hash component of current URL
    // do not change the page undo history
    const id =`#${this.xref}`;
    history.replaceState(null, null, id);

    // smoothly scroll to referenced component
    document.querySelector(id)
      .scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  renderTooltipContent(ref) {
    const tooltip = this.querySelector('.cross-ref-tooltip');

    // remove previous tooltip content
    tooltip.replaceChildren();
    cloneReference(tooltip, ref);

    // clear all additional styling classes on figures and tables
    tooltip.firstElementChild.className = (this.type === referenceTypes.FIGURE)
      ? 'figure' 
      : (this.type === referenceTypes.TABLE) ? 'table' : '';
  }

  renderUnresolvedReference(cls) {
    const tooltipContent = html`<div class="cross-ref-tooltip">
      Unresolved ${this.type} reference: ${this.xref}
    </div>`;

    return this.renderWithTooltip(`${cls} unresolved`, '?', tooltipContent);
  }
  
  renderResolvedReference(cls) {
    // render a default reference if it is a section reference
    if (this.type === referenceTypes.SECTION) {
      // remove default tooltip listeners for section references
      this.removeEventListener('keydown', this.keyDown);
      this.removeEventListener('mousedown', this.show);
      this.removeEventListener('focusout', this.focusOut);

      return html`<a class=${cls} href="#${this.xref}" @click=${this.goto}>${this.index}</a>`;
    } else {
      const tooltipContent = html`<div class="cross-ref-tooltip"></div>`;

      return this.renderWithTooltip(cls, this.index, tooltipContent);
    }
  }

  render() {
    const { type, index, short } = this;
    const resolved = index != null;
    const cls = `cross-ref ${type}${!short ? ' full' : ''}`;

    if (resolved) {
      return this.renderResolvedReference(cls);
    } else {
      return this.renderUnresolvedReference(cls);
    }
  }
}

const EQN_NUM_CLASSNAME = 'tag';

function cloneReference(parent, node) {
  // don't clone the equation number
  if (node.className === EQN_NUM_CLASSNAME) return;

  // clone the node with attributes
  const clone = node.cloneNode();

  // remove duplicate ids and attach to the parent
  if (clone.id) clone.removeAttribute('id');
  parent.append(clone);

  // check if we should clone the children
  if (hasUnclonableChildren(node)) return;

  for (const child of node.childNodes) {
    cloneReference(clone, child);
  }
}

const referenceTypes = {
  SECTION: 'sec',
  FIGURE: 'fig',
  TABLE: 'tbl',
  EQUATION: 'eqn',
}

const nodes = new Set([
  'CITE-REF',
  'CODE-BLOCK',
  'CROSS-REF',
  'INLINE-NOTE',
  'RANGE-TEXT',
  'TEX-MATH',
]);

const hasUnclonableChildren = (node) => {
  return nodes.has(node.tagName);
}
