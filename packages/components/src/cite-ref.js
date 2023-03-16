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

/*

<span class="cite-ref">
  content
  <div class="tooltip">
    <div class="cite-title"></div>
    <div class="cite-author"></div>
    <div class="cite-venue"></div>
    <div class="cite-detail"></div>
    Link to bibliography...
  </div>
</span>
*/

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
  const { url, title, year } = data;
  // TODO: is color inherit necessary? (removed for now...)
  return html`<div class="cite-title">
    <a href=${url} target="_blank" rel="noopener noreferrer">${title}</a>
    ${year ? `\u2022 ${year}` : ''}
  </div>`;
}

function renderCiteAuthor(data, maxAuthors = 4) {
  const { author } = data;
  const authors = (author || []).map(({ given, family }) => {
    return given
      ? `${given.includes('.') ? given : given[0] + '.'} ${family}`
      : family;
  });

  const display = authors.length > maxAuthors
    ? authors.slice(0, maxAuthors) // TODO make nuanaced + expandable
    : authors;

  return display.length
    ? html`<div class="cite-author">${display.join(', ')}</div>`
    : null;
}

function renderCiteVenue(data) {
  const { venue } = data;
  if (!venue) return null;

  // TODO: limit length, use target?
  return html`<div class="cite-venue">${venue}</div>`;
}

function renderCiteDetail(data, limit = 300) {
  const { abstract, tldr } = data;
  const detail = tldr || abstract;
  if (!detail) return null;
  const desc = detail !== tldr && detail.length > limit
    ? detail.slice(0, detail.slice(0, limit).lastIndexOf(' ')) + '…'
    : detail;

  // TODO: make shortened text expandable
  return html`<div class="cite-detail">${desc}</div>`;
}

// Returns inline authors, or abbrev. if there are more than etal authors
function inlineContent(data, index, etal = 2) {
  const { author, title } = data;
  if (!author || !author.length) return `${title} [${index}]`;

  let authors = author[0].family;
  if (author.length === 2) {
    authors += ` & ${author[1].family}`;
  } else if (author.length > etal) {
    authors += ' et al.';
  }
  return `${authors} [${index}]`;
}
