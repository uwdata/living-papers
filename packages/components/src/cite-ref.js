import { html } from 'lit';
import { Tooltip } from './tooltip.js';

export class CiteRef extends Tooltip {

  static get properties() {
    return {
      key: {type: String},
      mode: {type: String},
      index: {type: Number}
    };
  }

  constructor() {
    super();
    this.mode = 'citation';
  }

  initialChildNodes(nodes) {
    this.__prefix = nodes[0];
    this.__suffix = nodes[1];
  }

  citeData() {
    return this.data || (
      this.data = this.articleData()?.citations?.data[this.index - 1]
    );
  }

  render() {
    const { key, index, mode, data = this.citeData() } = this;

    const classes = `cite-ref${data ? '' : ' unresolved'}`;
    const content = data == null ? (index ?? '??')
      : mode === 'inline-author' ? inlineContent(data, index)
      : index;
    return this.renderWithTooltip(classes, content, renderCiteInfo(key, data));
  }
}

function renderCiteInfo(key, data) {
  if (data) {
    return html`<div class="cite-info">
      ${renderCiteTitle(data)}
      ${renderCiteAuthor(data)}
      ${renderCiteVenue(data)}
      ${renderCiteDetail(data)}
    </div>`;
  } else {
    return html`<div class="cite-info">
      <strong>Unresolved citation</strong><br>"${key}"
    </div>`;
  }
}

function renderCiteTitle(data) {
  const { url, title, year, author } = data;
  const date = year ? html`\u2022 <span class="cite-year">${year}</a>` : '';
  const text = title || authorNames(author).join(', ') || 'Unknown Title';
  if (url) {
    return html`<div class="cite-title">
      <a href=${url} target="_blank" rel="noopener noreferrer">${text}</a>
      ${date}
    </div>`;
  } else {
    return html`<div class="cite-title">${text}${date}</div>`;
  }
}

function authorNames(authorList) {
  return (authorList || []).map(({ given, family }) => {
    return given
      ? `${given.includes('.') ? given : given[0] + '.'} ${family}`
      : family;
  });
}

function renderCiteAuthor(data, maxAuthors = 4) {
  const { author, title } = data;
  if (!title) return null; // authors will be listed under title instead
  const authors = authorNames(author);
  const diff = authors.length - maxAuthors;
  if (diff > 1) { // ensure > 1, prevents case of +1 author only
    const authorsShow = authors.slice(0, maxAuthors).join(', ');
    const authorsHide = ', ' + authors.slice(maxAuthors).join(', ');
    const hiddenCount = html`<span class="cite-author-button" @click=${more}>+${diff}&nbsp;authors</span>`;
    const expand = html`<span class="cite-author-expand"> ${hiddenCount}</span>`;
    const collapse = html` <span class="cite-author-button" @click=${less}>less</span>`;
    const hidden = html`<span class="cite-author-hidden">${authorsHide}${collapse}</span>`;
    return html`<div class="cite-author">${authorsShow}${expand}${hidden}</div>`
  } else {
    return authors.length
      ? html`<div class="cite-author">${authors.join(', ')}</div>`
      : null;
  }
}

function more() {
  this.querySelector('.cite-author-expand').style.display = 'none';
  this.querySelector('.cite-author-hidden').style.display = 'inline';
}

function less() {
  this.querySelector('.cite-author-expand').style.display = 'inline';
  this.querySelector('.cite-author-hidden').style.display = 'none';
}

function renderCiteVenue(data) {
  const { venue } = data;
  return venue
    ? html`<div class="cite-venue">${venue}</div>`
    : null;
}

function renderCiteDetail(data, limit = 300) {
  const { abstract, tldr } = data;
  const detail = tldr || abstract;
  if (!detail) return null;
  const desc = detail !== tldr && detail.length > limit
    ? detail.slice(0, detail.slice(0, limit).lastIndexOf(' ')) + '…'
    : detail;

  // TODO: make shortened text expandable?
  return html`<div class="cite-detail">${desc}</div>`;
}

// Returns inline authors, or abbrev. if there are more than etal authors
function inlineContent(data, index, etal = 2) {
  const { author, title } = data;

  if (!author || !author.length) {
    return `${title} [${index}]`;
  }

  let authors = author[0].family;
  if (author.length === 2) {
    authors += ` & ${author[1].family}`;
  } else if (author.length > etal) {
    authors += ' et al.';
  }
  return `${authors} [${index}]`;
}
