import { html } from 'lit';
import { ArticleElement } from './article-element.js';

export class CiteRef extends ArticleElement {

  static get properties() {
    return {
      key: {type: String},
      mode: {type: String},
      index: {type: Number},
      data: {type: Object}
    };
  }

  constructor() {
    super();
    this.mode = 'citation';
    this.addEventListener('keydown', this.keyDown);
    this.addEventListener('mousedown', this.openCitation);
    this.addEventListener('focusout', this.focusOut);
  }

  focusOut(event) {
    if (!this.contains(event.relatedTarget)) {
      this.closeCitation();
    }
  }

  keyDown(event) {
    if (event.key == 'Enter') {
      this.openCitation();
    } else if (event.key == 'Escape') {
      this.closeCitation();
    }
  }

  closeCitation() {
    for (const child of this.querySelector('.cite-ref').children) {
      child.style.display = 'none';
    }
  }

  openCitation() {
    for (const child of this.querySelector('.cite-ref').children) {
      child.style.display = 'inline-block';
    }
  }

  // Expand and collapse info content
  toggleContent(event) {
    if (!window.getSelection().toString()) {
      const summary = event.target.querySelector('summary');
      event.target.open
        ? summary.textContent = summary.getAttribute('data-longtext') 
        : summary.textContent = summary.getAttribute('data-shorttext');
      }
  }

  initialChildNodes(nodes) {
    this.__prefix = nodes[0];
    this.__suffix = nodes[1];
  }

  render() {
    const { key, data, index, mode} = this;
    const wrapper = html`<div class='cite-info-wrapper'></div>`;

    // Unresolved citation
    if (data == null) {
      return html`<span class='cite-ref unresolved'>??${wrapper}<div class='cite-info'>
        <b>Unresolved citation</b><br>"${key}"</div></span>`;
    }

    const { fullInfo, shortInfo } = infoBody(data);
    const desctext = descBody(data);

    // Citation contents
    const subtitle = data.venue ? html`<div class='cite-head-subtitle'>${data.venue}</div>` : null;
    const info = shortInfo 
      ? html`<details class='cite-body-auth' @toggle=${this.toggleContent}>
              <summary data-shorttext=${shortInfo} data-longtext=${fullInfo}>${shortInfo}</summary>
            </details>`
      : html`<div class='cite-body-auth'>${fullInfo}</div>`;
    const desc = data.abstract && data.abstract !== desctext 
      ? html`<details class='cite-body-desc' @toggle=${this.toggleContent}>
              <summary data-shorttext=${desctext} data-longtext=${data.abstract}>${desctext}</summary>
            </details>`
      : html`<div class='cite-body-desc'>${desctext}</div>`;

    // Inline content
    const body = mode === 'inline-author' ? inlineContent(data, index) : index;

    return html`<span class='cite-ref' tabindex=0>${body}${wrapper}<div class='cite-info'>
      <a class='cite-head' href=${data.url} target="_blank" rel="noopener noreferrer" style="color: inherit;">
        <div class='cite-head-title'>${data.title}</div>${subtitle}
      </a>
      <div class='cite-body'>
        ${info}${desc}
      </div>
    </div></span>`;
  }
}

// Returns inline authors, or abbrev. if there are more than etal authors
function inlineContent(data, index, etal=2) {
  const { author } = data;

  let authors = author[0].family;
  if (author.length === 2) {
    authors += ` & ${author[1].family}`;
  } else if (author.length > etal) {
    authors += ' et al.';
  }

  return `${authors} [${index}]`;
}

function infoBody(data, maxAuthors=2) {
  const { author, year } =  data;

  const aMap = author.map(({ given, family }) => given 
    ? `${given.includes('.') ? given : given[0] + '.'} ${family}` 
    : family);
  const fullInfo = `${year} \u2022 ${aMap.join(', ')}`;
  const shortInfo = aMap.length > maxAuthors 
    ? `${year} \u2022 ${aMap.slice(0, maxAuthors).join(', ')} +${aMap.length - maxAuthors}` 
    : null;

  return {fullInfo, shortInfo};
}

function descBody(data, charLimit=300, defaultDesc='No description is available for this article.') {
  const { abstract, tldr } = data;

  const shortDesc = tldr || abstract || defaultDesc;
  
  return shortDesc.length > charLimit 
    ? shortDesc.substring(0, shortDesc.substring(0, charLimit).lastIndexOf(' ')) + '... ' 
    : shortDesc;
}
