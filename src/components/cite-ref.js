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
  }

  initialChildNodes(nodes) {
    this.__prefix = nodes[0];
    this.__suffix = nodes[1];
  }

  render() {
    const { key, data, index, mode } = this;
    const title = tooltip(data, key, index);
    const body = (mode === 'inline-author' ? inline(data, index) : index) || '??';
    return html`<span class="cite-ref" title=${title}>${this.__prefix}${body}${this.__suffix}</span>`;
  }
}

function tooltip(data, key, index) {
  return data
    ? `${authors(data)} (${data.year}). ${data.title}.${data.venue ? ` ${data.venue}.` : '' }`
    : !index ? `Unresolved citation: ${key}`
    : null;
}

function authors(data, etal = 2) {
  const { author } = data;
  if (author.length > etal) {
    const { given, family } = author[0];
    return `${given[0]}. ${family} et al.`;
  } else {
    return author
      .map(({ given, family }) => `${given[0]}. ${family}`)
      .join(', ');
  }
}

function inline(data, index) {
  let authors = '';

  if (data && data.author) {
    const { author } = data;
    authors = author[0].family;
    if (author.length === 2) {
      authors += ` & ${author[1].family}`;
    } else if (author.length > 2) {
      authors += ' et al.';
    }
    authors = html`${authors}&nbsp;`;
  }

  return html`${authors}<span class="cite-list">${index}</span>`;
}
