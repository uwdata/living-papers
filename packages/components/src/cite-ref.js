import { html } from 'lit';
import { ArticleElement } from './article-element.js';
import { Tooltip } from './tooltip.js'

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
  }

  toggleContent(event) {
    if (!window.getSelection().toString()) {
      const summary = event.target.querySelector('summary');
      event.target.open
        ? summary.textContent = summary.getAttribute('data-longtext') 
        : summary.textContent = summary.getAttribute('data-shorttext');
      }
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

    // Conference/venue of the paper
    const subtitle = data.venue ? html`<div class='cite-head-subtitle'>${data.venue}</div>` : null;

    // Display authors
    const info = shortInfo 
      ? html`<details class='cite-body-auth' @toggle=${this.toggleContent}>
              <summary data-shorttext=${shortInfo} data-longtext=${fullInfo}>${shortInfo}</summary>
            </details>`
      : html`<div class='cite-body-auth'>${fullInfo}</div>`;


    //Display description
    const desc = data.abstract && data.abstract !== desctext 
      ? html`<details class='cite-body-desc' @toggle=${this.toggleContent}>
              <summary data-shorttext=${desctext} data-longtext=${data.abstract}>${desctext}</summary>
            </details>`
      : html`<div class='cite-body-desc'>${desctext}</div>`;

    
    const body = mode === 'inline-author' ? inlineContent(data, index) : index;

    // HTML to render in the tooltip
    const renderHTML = html`${body}${wrapper}<div class='cite-info'>
      <a class='cite-head' href=${data.url} target="_blank" rel="noopener noreferrer" style="color: inherit;">
        <div class='cite-head-title'>${data.title}</div>${subtitle}
      </a>
      <div class='cite-body'>
        ${info}${desc}
      </div>
    </div>`;

    return html`${new Tooltip(renderHTML)}`;
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

// Format of author and year
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

//Format of description
function descBody(data, charLimit=300, defaultDesc='No description is available for this article.') {
  const { abstract, tldr } = data;

  const shortDesc = tldr || abstract || defaultDesc;
  
  // Limit description to 300 characters, adding '...' if character limit exceeds
  return shortDesc.length > charLimit 
    ? shortDesc.substring(0, shortDesc.substring(0, charLimit).lastIndexOf(' ')) + '... ' 
    : shortDesc;
}
