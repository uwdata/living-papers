import { html } from 'lit';
import { ArticleElement } from './article-element';

export class CrossRef extends ArticleElement {
  static get properties() {
    return {
      type: {type: String},
      xref: {type: String},
      index: {type: Number},
      short: {type: Boolean},
    };
  }

  constructor() {
    super();
    this.addEventListener('mousedown', this.show);
  }

  updated() {
    this.dragElement(this.querySelector('.fig-controls'));
  }

  hide() {
    this.querySelector('.fig-tooltip').style.display = 'none';
  }

  show() {
    this.querySelector('.fig-tooltip').style.display = 'inline-block';
  }

  minimizeFigure() {
    const tooltip = this.querySelector('.fig-tooltip');
    tooltip.style.width = '400px';
    tooltip.style.height = 'auto';
  }

  dragElement(el) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const tooltip = this.querySelector('.fig-tooltip');
    el.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = () => {
        document.onmouseup = null;
        document.onmousemove = null;
      };
      document.onmousemove = elementDrag;
    }
  
    const elementDrag = (e) => {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      tooltip.style.top = (tooltip.offsetTop - pos2) + "px";
      tooltip.style.left = (tooltip.offsetLeft - pos1) + "px";
    }
  }

  render() {
    const { type, xref, index, short } = this;
    const resolved = index != null;
    const id = `#${xref}`;
    const cls = `cross-ref ${type}${!short ? ' full' : ''}`;
    if (resolved) {
      return html`
        <span class=${cls}>${index}</span>
        <div class="fig-tooltip">
            <div class="fig-controls">
                    <a class="fig-minimize" @click=${this.minimizeFigure}></a>
                    <a class="fig-close" @click=${this.hide}/></a>
            </div>
            ${renderFigureTooltipBody(id)}
        </div>`;
    } else {
      return html`<a class="${cls} unresolved" title="Unresolved reference: ${xref}">?</a>`;
    }
  }
}

function renderFigureTooltipBody(id) {
  const figCopy = document.querySelector(id).cloneNode({deep:true});
  figCopy.className = 'figure';
  figCopy.removeAttribute('id');
  figCopy.querySelector('figcaption').removeAttribute('class');
  return html`<div class="fig-body">${figCopy}</div>`;
}
