import Cite from 'citation-js';

export class CitationManager {
  constructor(data) {
    this._cite = new Cite(data);
  }

  static async doi(key) {
    const cite = new Cite();
    await cite.addAsync(key);
    const ref = cite.data[0];
    ref.id = `doi:${key}`;
    return ref;
  }

  sort() {
    this._cite.sort();
    return this;
  }

  indexOf(id) {
    // TODO optimize
    return this._cite.data.findIndex(ref => ref.id === id);
  }

  get(id) {
    // TODO optimize
    return this._cite.data.find(ref => ref.id === id);
  }

  add(data) {
    this._cite.add(data);
    return this;
  }

  subset(ids) {
    this._cite = subset(this._cite, ids);
    return this;
  }

  data(ids) {
    return subset(this._cite, ids).data;
  }

  citation(ids, options) {
    options = {
      template: 'apa',
      lang: 'en-US',
      format: 'text',
      ...options
    };

    return subset(this._cite, ids)
      .format('citation', options)
      .trim();
  }

  bibliography(ids = null, options = {}) {
    options = {
      template: 'apa',
      lang: 'en-US',
      format: 'text',
      ...options
    };

    return subset(this._cite, ids).data
      .map(ref => new Cite(ref)
        .format('bibliography', options)
        .replaceAll('&amp;', '&')
        .trim()
      );
  }
}

function subset(cite, ids) {
  if (ids == null) return cite;
  const set = ids instanceof Set ? ids
    : new Set([ids].flat());
  return new Cite(cite.data.filter(ref => set.has(ref.id)));
}
