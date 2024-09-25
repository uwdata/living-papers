export function lookup(
  cache,
  fetch = globalThis.fetch
) {
  async function get(type, id, method) {
    const key = `${type}:${id}`;
    const data = await cache.get(key);
    if (data !== undefined) {
      return data;
    } else {
      let ref;
      try {
        ref = await method(id);
        ref.id = key;
      } catch (err) { // eslint-disable-line no-unused-vars
        ref = null;
      }
      cache.set(key, ref);
      return ref;
    }
  }

  function _doi(id) {
    return fetch(`https://doi.org/${id}`, {
      checkContentType: true,
      method: 'GET',
      headers: {
        Accept: 'application/vnd.citationstyles.csl+json'
      }
    }).then(res => res.json());
  }

  async function _s2id(id) {
    const resp = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/${id}?fields=externalIds`
    ).then(res => res.json());
    if (resp.error || !resp.externalIds?.DOI) {
      throw new Error(`Semantic Scholar load failed: ${id}`);
    }
    return _doi(resp.externalIds.DOI);
  }

  return {
    get,
    doi: id => get('doi', id, _doi),
    s2id: id => get('s2id', id, _s2id)
  };
}
