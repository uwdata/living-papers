import path from 'node:path';
import {
  createComponentNode, createTextNode, createProperties, getPropertyValue,
  setValueProperty, queryNodes, visitNodes, removeChild, setArticleDataProperty
} from '@living-papers/ast';
import { readFile } from '../../util/fs.js';
import { lookup } from './lookup.js';
import { Citations } from './citations.js';
import { scholarAPI } from './scholar-api.js';

const BIBLIOGRAPHY = 'bibliography';
const REFERENCES = 'references';
const CITEREF = 'citeref';
const CITELIST = 'citelist';
const KEYS = new Set(['doi', 's2id']);

export default async function(ast, context) {
  const { metadata, article } = ast;
  const { cache, fetch, inputDir, logger } = context;

  // extract all citation nodes in the AST
  const nodes = queryNodes(article, node => node.name === CITEREF);
  if (nodes.length === 0) return ast;

  // load bibliographic data for article
  const bib = await getBibliography(article, metadata, inputDir);

  // collect citations used in article
  const citations = await getCitations(nodes, bib, lookup(cache, fetch), logger);

  // set citation indices
  const indices = citations.indices();
  nodes.forEach(node => {
    const id = getPropertyValue(node, 'key');
    if (indices.has(id)) {
      setValueProperty(node, 'index', 1 + indices.get(id));
    }
  });

  // collect citation data to embed in article
  setArticleDataProperty(ast, 'citations', {
    bibtex: citations.bibtex(),
    csl: citations.refs(),
    data: await citationData(citations, scholarAPI(cache, fetch), logger)
  });

  // add bibliography to AST
  if (nodes.length) {
    article.children.push(createBibComponent(citations));
  }

  // sort citation lists in AST by ascending index
  updateCitationLists(article);

  return ast;
}

async function getBibliography(ast, metadata, inputDir) {
  const bib = new Citations();

  // collect bibliography files
  if (metadata.bibliography) {
    const sources = [metadata.bibliography].flat()
      .map(source => path.join(inputDir, source))
      .map(source => readFile(source));
    (await Promise.all(sources))
      .forEach(source => bib.parse(source));
  }

  // collect bibliography nodes
  visitNodes(ast, (node, parent) => {
    if (node.name === BIBLIOGRAPHY) {
      bib.parse(node.children[0].value);
      removeChild(parent, node);
    }
  });

  return bib;
}

async function getCitations(nodes, bib, lookup, logger) {
  const keys = new Set();
  const refs = bib.mapOf('id');
  const dois = bib.mapOf('DOI');
  const s2ids = bib.mapOf('S2ID');

  const addKey = (ref, type, key) => {
    if (ref) {
      keys.add(ref.id);
    } else {
      logger.warn(`Citation ${type} lookup failed: ${key}`);
    }
  }

  for (const node of nodes) {
    const [type, key] = getCiteKey(getPropertyValue(node, 'key'));
    let ref;
    let s2id;

    switch (type) {
      case 'key':
        ref = refs.get(key);
        addKey(ref, type, key);
        break;

      case 'doi':
        ref = dois.get(key);
        if (!ref) {
          ref = await lookup.doi(key);
          if (ref) (dois.set(key, ref), bib.add(ref));
        }
        addKey(ref, type, key);
        setValueProperty(node, 'key', ref?.id || `doi:${key}`);
        break;

      case 's2id':
        s2id = (+key == key && key.length < 40) ? `CorpusID:${key}` : key;
        ref = s2ids.get(s2id);
        if (!ref) {
          ref = await lookup.s2id(s2id);
          if (ref) {
            const doi = ref.DOI;
            ref = dois.get(doi) || (dois.set(doi, ref), bib.add(ref), ref);
            ref.S2ID = s2id;
          }
        }
        addKey(ref, type, key);
        setValueProperty(node, 'key', ref?.id || `s2id:${s2id}`);
        break;

      default:
        throw new Error(`Unrecognized citation prefix: ${type}`);
    }
  }

  // filter and sort references
  return bib.subset(keys).sort();
}

function getCiteKey(key) {
  const [type, ...rest] = key.split(':');
  return rest.length && KEYS.has(type)
    ? [type, rest.join(':')]
    : ['key', key];
}

async function citationData(citations, api, logger) {
  const s2data = await scholarData(citations, api, logger);

  return citations.refs().map((ref, i) => {
    const s2 = s2data[i] || {};
    const title = (ref.title ?? '') + (ref.subtitle?.length ? `: ${ref.subtitle}` : '');
    return {
      id: ref.id,
      doi: ref.DOI || s2.doi || undefined,
      s2id: s2.paperId,
      year: s2.year || ref.issued?.['date-parts'][0][0],
      author: ref.author,
      title: title.replace('&amp;', '&'),
      venue: ref['container-title'] || s2.venue || undefined,
      url: ref.URL || s2.url || undefined,
      abstract: s2.abstract || undefined,
      tldr: s2.tldr?.text
    };
  });
}

function scholarData(citations, api, logger) {
  function response(data) {
    if (data.error) {
      logger.warn(`Semantic Scholar: ${data.error}`);
      return;
    }
    return data;
  }

  // attempt to resolve semantic scholar ids
  return Promise.all(
    citations.refs().map(async ref => {
      let data;
      if (!data && ref.S2ID) {
        data = response(await api.paper(ref.S2ID));
      }
      if (!data && ref.DOI) {
        data = response(await api.paper(`DOI:${ref.DOI}`));
      }
      if (!data && ref.PMID) {
        data = response(await api.paper(`PMID:${ref.PMID}`));
      }
      return data;
    })
  );
}

function updateCitationLists(ast) {
  visitNodes(ast, node => {
    if (node.name !== CITELIST) return;
    setValueProperty(node, 'class', 'cite-list');
    node.children.sort(
      (a, b) => getPropertyValue(a, 'index') - getPropertyValue(b, 'index')
    );
    node.children = [
      createTextNode('['),
      ...node.children
        .map((node, i) => i > 0 ? [ createTextNode(', '), node ] : node)
        .flat(),
      createTextNode(']')
    ];
  });
  return ast;
}

function createBibComponent(refs) {
  const lines = refs.bibliography();
  const list = createComponentNode(
    'ol',
    createProperties({ class: 'references' })
  );
  list.children = lines.map((text, i) => {
    return createComponentNode(
      'li',
      createProperties({ id: `ref-${i}` }),
      createBibEntry(text)
    );
  });
  return createComponentNode(REFERENCES, null, [ list ]);
}

function createBibEntry(text) {
  const parts = text.split(/ (https?:\/\/.*$)/);
  if (parts.length > 1) {
    return [
      createTextNode(parts[0] + ' '),
      createComponentNode(
        'link',
        createProperties({ href: parts[1] }),
        [ createTextNode(parts[1]) ]
      )
    ];
  } else {
    return [ createTextNode(text) ];
  }
}
