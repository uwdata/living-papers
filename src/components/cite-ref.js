import { html, _$LE } from 'lit';
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

    let active = null; // The time that the citation stays open for
    let citeref = this; 

    // On hover, open the citation after a certain amount of time
    this.addEventListener('mouseenter', function(){
      if(active !== null) {
        clearTimeout(active);
        active = null;
      }
      active = setTimeout(function() {citeref.querySelector('.cit') ? citeref.querySelector('.cit').style.display = 'inline':citeref.querySelector('.cit-err').style.display = 'inline';}, 300);
    });

    // On hover off, close the citation after a certain amount of time
    this.addEventListener('mouseleave', function() {
      if(active !== null) {
        clearTimeout(active);
        active = null;
      }
      active =  setTimeout(function() {citeref.querySelector('.cit') ? citeref.querySelector('.cit').style.display = 'none':citeref.querySelector('.cit-err').style.display = 'none';}, 300);
    });
  }

  initialChildNodes(nodes) {
    this.__prefix = nodes[0];
    this.__suffix = nodes[1];
  }

  render() {
    const { key, data, index, mode } = this;

    if (key == null || data == null) { return unresolvedCitation() } // Missing data, or key

    // Missing minimum of title, year, and author data
    if (data.title == null || data.year == null || data.author == null) { return unresolvedCitation() }

    // Citation contents
    const arrow = html`<div class='cit-head-arrow'><p>${index}</p></div>`;
    const title = html`<div class='cit-head-title'>${data.title}</div>`;
    const subtitle = data.venue ? html`<div class='cit-head-subtitle'>${data.venue}</div>`:null; // Empty if no venue
    const info = infoBody(data);
    const desc = descBody(data, 300);

    // Inline content
    const body = mode === 'inline-author' ? inlineContent(data) : index;

    return html`<span class='citation'>${body}
                  <div class='cit'>
                    <a class='cit-head' href=${data.url} target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">${arrow}${title}${subtitle}</a>
                    <div class='cit-body'>${info}${desc}</div>
                  </div>
                </span>`;
  }
}

// Returns inline authors, or abbrev. if there are more than etal authors
function inlineContent(data, etal=2) {
  const { author } = data;

  let authors = author[0].family;
  if (author.length === 2) {
    authors += ` & ${author[1].family}`;
  } else if (author.length > etal) {
    authors += ' et al.';
  }

  return authors;
}

// Returns an unresolved citation
function unresolvedCitation() {
  return html`<span class ='citation-err'>??<div class='cit-err'><div class='cit-err-arrow'></div>Unresolved citation</div></span>`;
}

// Returns the info portion of the body, with authors and year, if more than max authors
// add the option to expand/collapse section
function infoBody(data, max=2) {
  const { author } =  data;
  const { year } = data;

  const aMap = author.map(({ given, family }) => `${given.includes('.') ? given:given[0] + '.'} ${family}`);   // List all authors as F.M. Last
  const aMapMax = aMap.slice(0, max); // List all up to etal authors
  const authNum = '+' + (aMap.length - aMapMax.length); // Representation of authors past max
  const shortInfo = '' + year + ' \u2022 ' + aMapMax.join(', '); // Shortened info section
  const info = '' + year + ' \u2022 ' + aMap.join(', '); // Full indo section

  // Button event, update button info, rotate arrow, swap to the corresponding text
  const onClick = "let x=event.target.parentElement.querySelector('span')||event.target;let y=x.parentElement;let z=y.parentElement;"+
                  "(x.style.transform==='rotate(0deg)')"+
                  "?(x.style.transform='rotate(-90deg)',z.childNodes[1].nodeValue=z.getAttribute('shortinfo'),y.childNodes[1].textContent=z.getAttribute('authnum'))"+
                  ":(x.style.transform='rotate(0deg)',z.childNodes[1].nodeValue=z.getAttribute('info'),y.childNodes[1].textContent='\u00A0')";
  const style = "display: inline; border: none; background: none;"; // Button style
  const arrow = html`<span style='position: absolute; transform: rotate(-90deg);'>&#9660;</span>`; // Button arrow

  // Expand/collapse button, null if unneeded
  const button = aMap.length !== aMapMax.length ? html`<button style=${style} onclick=${onClick}>${authNum}${arrow}</button>`:null; 

  return html`<div class='cit-body-auth' info=${info} shortinfo=${shortInfo} authnum=${authNum}>${shortInfo}${button}</div>`;
}

// Returns the description portion of the body, limits the description by tokens if over char limit
function descBody(data, charLimit) {
  const { abstract } = data;
  const { tldr } = data;
  // Prioritize tldr, then abstract, if none use error message. Then limit tokens
  const shortDesc = limitTokens(tldr || abstract || 'No description is available for this article.', charLimit);

  // Button event, rotate arrow, swap to the corresponding text
  const onClick = "let parent=event.target.parentElement;"+
                  "(event.target.style.transform==='rotate(0deg)')"+
                  "?(event.target.style.transform='rotate(-90deg)',parent.childNodes[1].textContent=parent.getAttribute('shortdesc'))"+
                  ":(event.target.style.transform='rotate(0deg)',parent.childNodes[1].textContent=parent.getAttribute('abstract'))";
  const style = "position: absolute; left: calc(50% - 16px); bottom: 0; border: none; background: none; transform: rotate(-90deg); font-size: 16px;"; // Button style

  // Expand/collapse button, null if unneeded
  const button = abstract ? html`<button style=${style} onclick=${onClick} >&#9660;</button>`:null;

  return html`<div class='cit-body-desc' abstract=${abstract} shortdesc=${shortDesc}>${shortDesc}${button}</div>`;
}

// Returns tokens with the sum of characters less than the character limit
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