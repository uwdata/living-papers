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

  // TODO: 1. expand content on info/authors
  //       2. citation interactive features
  //       3. citation out of viewport behavior
  render() {
    const { key, data, index, mode } = this;

    // Missing data
    if (data == null) { return unresolvedCitation() }

    // Missing minimum of title, year, and author data
    if (data.title == null || data.year == null || data.author == null) { return unresolvedCitation() }

    // Citation contents
    const title = data.title;
    const year = itemInfo('' + data.year, 30);
    const venue = itemInfo('' + data.venue, 30); // Blank if missing
    const authors = authorsBody(data);
    const abstract = abstractBody(data, 300);

    // Inline content
    const body = mode === 'inline-author' ? inlineContent(data) : index;

    return html`
    <span class='citation'>${body}<span class='cit'>
        <div class='cit-head'>
          <div class='cit-head-title'>${title}</div>
          <div class='cit-head-info'>${year}${venue}</div>
        </div>
        <div class='cit-body'>${authors}${abstract}</div>
      </span></span>`;
  }
}

// Inline content
function inlineContent(data) {
  const { author } = data;

  let authors = author[0].family;
  if (author.length === 2) {
    authors += ` & ${author[1].family}`;
  } else if (author.length > 2) {
    authors += ' et al.';
  }

  return authors;
}

// Returns an unresolved citation
function unresolvedCitation() {
  return html`<span class ='citation-err'>??<span class ='cit-err'>Unresolved Citation</span></span>`;
}

// Returns a div containing info items
function itemInfo(info, charLimit) {
  const infoText = limitTokens(info, charLimit);

  // Return the corresponding styled div class
  return html`<div class='cit-info-item'>${infoText}</div>`;
}

// Returns a div containing the authors displayed in the body of the citation
function authorsBody(data, etal = 10) {
  const { author } = data;
  // List all authors with initials for first/middle name followed by last name
  const authors = author.map(({ given, family }) => `${given.includes('.') ? given:given[0] + '.'} ${family}`);

  // Create text string, if there are more than authors 10 authors, abbreviate with et al
  const authText = authors.length > etal ? authors.slice(0,10).join(', ') + ' et al.': authors.join(', ');

  // Return the corresponding styled div class
  return html`<div class='cit-body-auth'> ${authText}</div>`;
}

// Returns a div containing the abstract displayed in the body of the citation
function abstractBody(data, charLimit) {
  const { abstract } = data;
  // Default no abstract
  let absText = 'No abstract is available for this article.';

  // Abstract is in data
  if (abstract != null) { absText = limitTokens(abstract, charLimit); }

  // Return the corresponding styled div class
  return html`<div class='cit-body-abst'>${absText}</div>`;
}

// Returns a string with less characters than the character limit
function limitTokens(input, charLimit) {
  let tokens = input.split(' ');
  let text = '';
  for (let i = 0; i < tokens.length; i++) {
    if ((text + tokens[i]).length > charLimit) { // If it is longer than the char limit, stop and add ellipses
      text += '... ';
      break;
    }
    text += ' ' + tokens[i];
  }
  return text;
}

// function tooltip(data, key, index) {
//   return data
//     ? `${authors(data)} (${data.year}). ${data.title}.${data.venue ? ` ${data.venue}.` : '' }`
//     : !index ? `Unresolved citation: ${key}`
//     : null;
// }

// function authors(data, etal = 2) {
//   const { author } = data;
//   if (author.length > etal) {
//     const { given, family } = author[0];
//     return `${given[0]}. ${family} et al.`;
//   } else {
//     return author
//       .map(({ given, family }) => `${given[0]}. ${family}`)
//       .join(', ');
//   }
// }

// function inline(data, index) {
//   let authors = '';

//   if (data && data.author) {
//     const { author } = data;
//     authors = author[0].family;
//     if (author.length === 2) {
//       authors += ` & ${author[1].family}`;
//     } else if (author.length > 2) {
//       authors += ' et al.';
//     }
//     authors = html`${authors}&nbsp;`;
//   }

//   return html`${authors}<span class="cite-list">${index}</span>`;
// }
