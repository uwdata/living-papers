import fetch from 'node-fetch';

const BASE_URL = 'https://api.semanticscholar.org/graph/v1/';
const PAPER_SEARCH = 'paper/search';
const PAPER = 'paper';

const DEFAULT_FIELDS = [
  'url', 'title', 'abstract', 'venue', 'year',
  'referenceCount', 'citationCount', 'tldr'
];

function cleanQueryText(text) {
  return text
    .toLowerCase()
    .replace(/&amp;|[!,.:;'"]/g, '')
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3) // removes lots of stop words
    .join(' ');
}

function apiCall(method, params) {
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  const url = `${BASE_URL}${method}?${queryString}`;
  return fetch(url).then(res => res.json());
}

export function lookup(ref) {
  const query = [
      ref.title || '',
      ref.subtitle || '',
      ...(ref.author ? ref.author.map(a => a.family) : '')
    ]
    .filter(x => x && x.length > 0)
    .join(' ');

  return search({ query });
}

export function search(params) {
  return apiCall(PAPER_SEARCH, {
    ...params,
    query: cleanQueryText(params.query || '')
  });
}

export function paper(id, params) {
  return apiCall(`${PAPER}/${id}`, {
    fields: DEFAULT_FIELDS,
    ...params,
  });
}
