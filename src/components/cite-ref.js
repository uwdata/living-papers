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
    const subtitle = data.venue; // Blank if missing
    const year = itemInfo('' + data.year, 30);
    const venue = itemInfo('' + data.doi, 30); // Blank if missing
    const authors = authorsBody(data);
    const abstract = abstractBody(data, 300);

    // Inline content
    const body = mode === 'inline-author' ? inlineContent(data) : index;

    return html`
    <span class='citation'>${body}<div class='cit'>
        <div class='arrow-left'></div>
        <div class='cit-head'>
          <div class='cit-head-title'>${title}</div>
          <div class='cit-head-subtitle'>${subtitle}</div>
        </div>
        <div class='cit-body'>
        <div class='cit-head-info'>${year}${venue}</div>
        ${authors}${abstract}</div>
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
  return html`<span class ='citation-err'>??<span class ='cit-err'><div class='arrow-left'></div>Unresolved Citation</span></span>`;
}

// Returns a div containing info items
function itemInfo(info, charLimit) {
  const infoText = limitTokens(info, charLimit);

  // Return the corresponding styled div class
  return html`<div class='cit-info-item'>${infoText}</div>`;
}

// Returns a div containing the authors displayed in the body of the citation
function authorsBody(data, etal = 10) {
  const { author } =  data;
  // List all authors with initials for first/middle name followed by last name
  const authors = author.map(({ given, family }) => `${given.includes('.') ? given:given[0] + '.'} ${family}`);

  // Create text string, if there are more than authors 10 authors, abbreviate with et al
  const authText = authors.length > etal ? authors.slice(0,etal).join(', ') + ' et al.': authors.join(', ');

  // Return the corresponding styled div class
  return html`<div class='cit-body-auth'> ${authText}</div>`;
}

// Returns a div containing the abstract displayed in the body of the citation
function abstractBody(data, charLimit) {
  const { abstract } = data;
  const { tldr } = data;
  // Prioritize tldr, then abstract, if none use error message
  let absText = tldr || abstract || 'No abstract is available for this article.';

  // Return the corresponding styled div class
  return html`<div class='cit-body-abst'>${limitTokens(absText, charLimit)}</div>`;
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
