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

    const hoverDelay = 300;
    let active = null;

    // On hover, open the citation after a certain amount of time
    this.addEventListener('mouseenter', () => {
      if (active !== null) {
        clearTimeout(active);
        active = null;
      }
      active = setTimeout(
        () => this.querySelector('.cite-info').style.display = 'inline',
        hoverDelay
      );
    });

    // On hover off, close the citation after a certain amount of time
    this.addEventListener('mouseleave', () => {
      if (active !== null) {
        clearTimeout(active);
        active = null;
      }
      active =  setTimeout(
        () => this.querySelector('.cite-info').style.display = 'none',
        hoverDelay
      );
    });
  }

  initialChildNodes(nodes) {
    this.__prefix = nodes[0];
    this.__suffix = nodes[1];
  }

  render() {
    const { key, data, index, mode} = this;

    // Unresolved citation
    if (data == null) {
      return html`<span class='cite-ref unresolved'>??<div class='cite-info'>
<div class='cite-info-arrow'></div><b>Unresolved citation</b><br>"${key}"</div></span>`;
    }

    // Citation contents
    const arrow = html`<div class='cite-head-arrow'></div>`;
    const title = html`<div class='cite-head-title'>${data.title}</div>`;
    const subtitle = data.venue ? html`<div class='cite-head-subtitle'>${data.venue}</div>` : null;
    const info = infoBody(data);
    const desc = descBody(data);

    // Inline content
    const body = mode === 'inline-author' ? inlineContent(data, index) : index;

    return html`<span class='cite-ref'>${body}<div class='cite-info'>
      <a class='cite-head' href=${data.url} target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">
        ${arrow}${title}${subtitle}
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

  return authors + ' [' + index + ']';
}

// Returns the info portion of the body, with authors and year,
// if more than max authors add the option to expand/collapse section
function infoBody(data, max=2) {
  const { author, year } =  data;

  const aMap = author.map(({ given, family }) => `${given.includes('.') ? given:given[0] + '.'} ${family}`);   // List all authors as F.M. Last
  const info = '' + year + ' \u2022 ' + aMap.join(', '); // Full info section
  let shortInfo = info; // Shortened info section
  let button = null; // Expand/collapse button, null if unneeded

  if (aMap.length > max) {
    const authNum = '+' + (aMap.length - max); // Representation of authors past max
    shortInfo = '' + year + ' \u2022 ' + aMap.slice(0, max).join(', '); // Shortened info section

    // Button event, update button info, rotate arrow, swap to the corresponding text
    const onClick = "let x=event.target.parentElement.querySelector('span')||event.target;let y=x.parentElement;let z=y.parentElement;"+
                    "(x.style.transform==='rotate(0deg)')"+
                    "?(x.style.transform='rotate(-90deg)',z.childNodes[1].nodeValue=y.getAttribute('shortinfo'),y.childNodes[1].textContent=y.getAttribute('authnum'))"+
                    ":(x.style.transform='rotate(0deg)',z.childNodes[1].nodeValue=y.getAttribute('info'),y.childNodes[1].textContent='\u00A0')";
    const style = "display: inline; border: none; background: none;";
    const arrow = html`<span style='position: absolute; transform: rotate(-90deg);'>&#9660;</span>`;

    button = html`<button style=${style} onclick=${onClick} info=${info} shortinfo=${shortInfo} authnum=${authNum}>${authNum}${arrow}</button>`;
  }

  return html`<div class='cite-body-auth'>${shortInfo}${button}</div>`;
}

// Returns the description portion of the body, limits the description by tokens if over char limit
function descBody(data, charLimit=300) {
  const { abstract, tldr } = data;

  // Prioritize tldr, then abstract, if none use error message.
  let shortDesc = tldr || abstract || 'No description is available for this article.';

  // Limit the token characters to under the character limit
  if (shortDesc.length > charLimit) {
     shortDesc = shortDesc.substring(0, shortDesc.substring(0, charLimit).lastIndexOf(' ')) + '... ';
  }

  let button = null; // Expand/collapse button, null if unneeded

  if (abstract != null) {
    // Button event, rotate arrow, swap to the corresponding text
    const onClick = "(event.target.style.transform==='rotate(0deg)')"+
                    "?(event.target.style.transform='rotate(-90deg)',event.target.parentElement.childNodes[1].textContent=event.target.getAttribute('shortdesc'))"+
                    ":(event.target.style.transform='rotate(0deg)',event.target.parentElement.childNodes[1].textContent=event.target.getAttribute('abstract'))";
    const style = "position: absolute; left: calc(50% - 16px); bottom: 0; border: none; background: none; transform: rotate(-90deg); font-size: 16px;";

    button = html`<button style=${style} onclick=${onClick} abstract=${abstract} shortdesc=${shortDesc}>&#9660;</button>`;
  }

  return html`<div class='cite-body-desc'>${shortDesc}${button}</div>`;
}
