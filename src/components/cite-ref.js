import { LitElement, html, css } from 'lit';

export class CiteRef extends LitElement {
  static get styles() {
    return css`
      .citation {
        font-weight: bold;
      }

      .citation:hover {
        color: steelblue;
      }

      .citation:not(:hover) * {
        display: none;
      }

      .cit {
        position: absolute;
        transform: translate(-15px, 20px);
        width: 300px;
        background: whitesmoke;
        font-size: small;
        font-weight: 300;
        color: black;
        filter: drop-shadow(1px 1px 3px lightgray);
        border-radius: 10px 10px 10px 10px;
        border: .1px solid black;
      }

      .cit-head {
        display: flex;
        flex-direction: column;
        background: rgb(230, 230, 230);
        padding: 5px 10px 5px 10px;
        border-radius : 10px 10px 0 0;
      }
      
      .cit-head-title {
        min-height: 24px;
        line-height: 1;
        font-size: medium;
      }
      
      .cit-head-info {
        padding-top: 5px;
        min-height: 18px;
        display: flex;
        justify-content: space-between;
      }
      
      .cit-body {
        padding: 5px 10px 5px 10px;
        border-radius : 0 0 10px 10px;
        border-top: .1px solid black;
        line-height: 1.3;
      }
      
      .cit-body-auth {
        min-height: 18px;
        padding-bottom: 5px;
      }
      
      .cit-body-abst {
        min-height: 108px;
        padding-top: 5px;
        border-top: .1px solid black;
      }`;
  }
}

export class CiteRef extends ArticleElement {
  static get properties() {
    return {
      key: {type: String},
      mode: {type: String},
      index: {type: Number},
      data: {type: Object},
      cit_head_title: {type: String},
      cit_info_year: {type: String},
      cit_info_lab: {type: String},
      cit_body_auth: {type: String},
      cit_body_abst: {type: String}
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
    const { key, data, index, mode,
       cit_head_title, cit_info_year, cit_info_lab,
        cit_body_auth, cit_body_abst } = this;
    const title = tooltip(data, key, index);
    const body = (mode === 'inline-author'
      ? (data ? inlineAuthor(data) : '??')
      : index) || '??';
    return html`
    <span class ='citation'>${index}
      <span class='cit'>
        <div class='cit-head'>
          <div class='cit-head-title'>${cit_head_title}</div>
          <div class='cit-head-info'>
            <div class='cit-info-item'>${cit_info_year}</div>
            <div class='cit-info-item'>${cit_info_lab}</div>
          </div>
        </div>
        <div class='cit-body'>
          <div class='cit-body-auth'>${cit_body_auth}</div>
          <div class='cit-body-abst'>${cit_body_abst}</div>
        </div>
      </span>
    </span> 
    `;
  }
}

function tooltip(data, key, index) {
  return data
    ? `${authors(data)} (${data.year}) ${data.title}. ${data.venue}.`
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
