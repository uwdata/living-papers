import { LitElement, html, css } from 'lit';

export class CiteRef extends LitElement {
  static get styles() {
    return css`
      .citation {
        text-decoration: underline dotted #aaa;
      }
    `;
  }

  static get properties() {
    return {
      mode: {type: String},
      index: {type: Number},
      data: {type: Object},
      s2id: {type: String}
    };
  }

  constructor() {
    super();
    this.mode = 'citation';
  }

  render() {
    const { data, index, mode } = this;
    const title = `${authors(data)} (${data.year}) ${data.title}. ${data.venue}.`;
    const body = mode === 'inline-author' ? inlineAuthor(data) : index;
    return html`<span class="citation" title=${title}><slot name="prefix"></slot>${body}<slot name="suffix"></slot></span>`;
  }
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

// TODO: what if no author?
function inlineAuthor(data) {
  const { author, year } = data;
  let authors = author[0].family;
  if (author.length === 2) {
    authors += ` & ${author[1].family}`;
  } else if (author.length > 2) {
    authors += ' et al.';
  }
  return authors;
}
