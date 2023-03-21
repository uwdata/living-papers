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

  renderRefContent(ref) {
    const tooltip = this.querySelector('.cross-ref-tooltip');
    tooltip.innerHTML = '';
    cloneReference(tooltip, ref, ['id', 'code'], ['cite-ref', 'eqn-num']);
    if (this.type === 'fig') this.querySelector('.figure').className = 'figure';
  }

  show() {
    if (this.index != null) this.renderRefContent(document.getElementById(this.xref));
    this.querySelector('.tooltip').style.display = 'inline-block';
  }

  render() {
    const { type, xref, index, short } = this;
    const resolved = index != null;
    const cls = `cross-ref ${type}${!short ? ' full' : ''}${resolved ? '' : ' unresolved'}`;
    const content = index || '??';
    return this.renderWithTooltip(cls, content, renderTooltipContent(resolved, xref));
  }
}

function renderTooltipContent(resolved, xref) {
  if (resolved) {
    return html`<div class="cross-ref-tooltip"></div>`;
  } else {
    return html`<div class="cross-ref-error-tooltip">Unresolved reference: ${xref}</div>`;
  }
}

function cloneReference(parent, node, skipAttrs=[], skipClasses=[]) {
  for (const cls of skipClasses) {
    if (`${node.className}`.includes(cls)) return;
  }
  const clone = node.cloneNode();
  for (const attr of skipAttrs) {
    if (clone[attr]) clone.removeAttribute(attr);
  }
  parent.append(clone);
  for (const child of node.childNodes) {
    cloneReference(clone, child, skipAttrs, skipClasses);
  }
}
