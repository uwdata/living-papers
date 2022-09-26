const BASE_URL = 'https://api.semanticscholar.org/graph/v1/';
const PAPER_SEARCH = 'paper/search';
const PAPER = 'paper';

const DEFAULT_FIELDS = [
  'url', 'title', 'abstract', 'venue', 'year',
  'referenceCount', 'citationCount', 'tldr'
];

export function scholarAPI(
  cache = { get: () => undefined, set: () => {} },
  fetch = globalThis.fetch
) {
  async function get(method, params) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    const url = `${BASE_URL}${method}?${queryString}`;

    const value = await cache.get(url);
    if (value !== undefined) {
      return value;
    } else {
      const data = await fetch(url).then(res => res.json());
      cache.set(url, data);
      return data;
    }
  }

  function search(params) {
    return get(PAPER_SEARCH, {
      ...params,
      query: cleanQueryText(params.query || '')
    });
  }

  return {
    search,
    lookup(ref) {
      const query = [
          ref.title || '',
          ref.subtitle || '',
          ...(ref.author ? ref.author.map(a => a.family) : '')
        ]
        .filter(x => x && x.length > 0)
        .join(' ');

      return search({ query });
    },
    paper(id, params) {
      return get(`${PAPER}/${id}`, {
        fields: DEFAULT_FIELDS,
        ...params,
      });
    }
  };
}

function cleanQueryText(text) {
  return text
    .toLowerCase()
    .replace(/&amp;|[!,.:;'"]/g, '')
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3) // removes lots of stop words
    .join(' ');
}
