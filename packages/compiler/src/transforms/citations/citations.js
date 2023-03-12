import Cite from 'citation-js';

export class Citations {
  constructor(data) {
    this._refs = data?.slice() || [];
  }

  add(ref) {
    this._refs.push(ref);
    return this;
  }

  parse(data) {
    new Cite(data).data.forEach(ref => {
      delete ref._graph;
      this.add(ref);
    });
    return this;
  }

  subset(ids) {
    return new Citations(this.refs(ids));
  }

  refs(ids) {
    return ids ? filterBy(this._refs, ids) : this._refs.slice();
  }

  sort() {
    this._refs.sort((a, b) => {
      a = label(a), b = label(b);
      return a < b ? -1 : a > b ? 1 : 0;
    });
    return this;
  }

  mapOf(property) {
    const map = new Map;
    this._refs.forEach(ref => {
      const key = ref[property];
      if (!key) return;
      if (map.has(key)) {
        console.warn(`Skipping duplicate citation ${property}: ${key}.`);
      } else {
        map.set(key, ref);
      }
    });
    return map;
  }

  indices() {
    const idx = new Map;
    this._refs.forEach((ref, i) => idx.set(ref.id, i));
    return idx;
  }

  citation(ids, options) {
    options = {
      template: 'apa',
      lang: 'en-US',
      format: 'text',
      ...options
    };

    return new Cite(this.refs(ids))
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

    return this.refs(ids).map(
      ref => new Cite(ref)
        .format('bibliography', options)
        .replaceAll('&amp;', '&')
        .trim()
    );
  }

  bibtex(ids = null) {
    // format bibtex, work around citation-js id mangling
    return this.refs(ids).map(ref => {
      return new Cite(ref)
        .format('bibtex')
        .replace(/^(@\w+\{)\w+,/, `$1${ref.id},`)
        .replace(/&amp;/, '\\&')
        .trim();
    });
  }
}

function filterBy(data, ids) {
  const set = ids instanceof Set ? ids : new Set([ids].flat());
  return data.filter(ref => set.has(ref.id));
}

function label(csl) {
  return csl['citation-label'] || (
    (csl.author ? (csl.author[0].family || csl.author[0].literal) : '') +
    (csl.issued?.['date-parts']?.[0][0] || '') +
    (csl['year-suffix'] || leadingWord(csl.title))
  );
}

function leadingWord(title) {
  return title
    ? title.replace(/<\/?.*?>/g, '').match(/^(?:(?:the|a|an)\s+)?(\S+)/i)[1]
    : '';
}
