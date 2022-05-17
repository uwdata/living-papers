import path from 'node:path';
import {
  createComponentNode, createTextNode, getPropertyValue,
  setValueProperty, queryNodes, visitNodes, hasProperty, removeChild
} from '../../ast/index.js';
import { readFile } from '../../util/fs.js';
import { lookup } from './lookup.js';
import { Citations } from './citations.js';
import { scholarAPI } from './scholar-api.js';

const BIBLIOGRAPHY = 'bibliography';
const CITE_BIB = 'cite-bib';
const CITE_REF = 'cite-ref';
const CITE_LIST = 'cite-list';

export default async function(ast, context) {
  const { cache, fetch, inputDir, metadata, logger } = context;

  // extract all citation nodes in the AST
  const nodes = queryNodes(ast, node => node.name === CITE_REF);
  if (nodes.length === 0) return ast;

  // load bibliographic data for article
  const bib = await getBibliography(ast, metadata, inputDir);

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
  const data = await citationData(citations, scholarAPI(cache, fetch));
  metadata.references = data;

  // add bibliography to AST
  if (nodes.length) {
    ast.children.push(createBibComponent(citations));
  }

  // sort citation lists in AST by ascending index
  updateCitationLists(ast);

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

  for (const node of nodes) {
    let ref;

    if (hasProperty(node, 'key')) {
      const key = getPropertyValue(node, 'key');
      if (ref = refs.get(key)) {
        keys.add(key);
      } else {
        logger.warn(`Citation key not found: ${key}`);
      }
    }

    if (!ref && hasProperty(node, 'doi')) {
      const doi = getPropertyValue(node, 'doi');
      if (!(ref = dois.get(doi))) {
        ref = await lookup.doi(doi);
        if (ref) (dois.set(doi, ref), bib.add(ref));
      }
      if (ref) {
        keys.add(ref.id);
      } else {
        logger.warn(`Citation DOI lookup failed: ${doi}`);
      }
      setValueProperty(node, 'key', ref?.id || `doi:${doi}`);
    }

    if (!ref && hasProperty(node, 's2id')) {
      const id = getPropertyValue(node, 's2id');
      const s2id = (+id == id && id.length < 40) ? `CorpusID:${id}` : id;
      if (!(ref = s2ids.get(s2id))) {
        ref = await lookup.s2id(s2id);
        if (ref) {
          const doi = ref.DOI;
          ref = dois.get(doi) || (dois.set(doi, ref), bib.add(ref), ref);
          ref.S2ID = s2id;
        }
      }
      if (ref) {
        keys.add(ref.id);
      } else {
        logger.warn(`Citation S2ID lookup failed: ${s2id}`);
      }
      setValueProperty(node, 'key', ref?.id || `s2id:${s2id}`);
    }
  }

  // filter and sort references
  return bib.subset(keys).sort();
}

async function citationData(citations, api, logger) {
  const s2data = await scholarData(citations, api, logger);

  return citations.refs().map((ref, i) => {
    const s2 = s2data[i] || {};
    return {
      id: ref.id,
      doi: ref.DOI || s2.doi || undefined,
      s2id: s2.paperId,
      year: s2.year || ref.issued?.['date-parts'][0][0],
      author: ref.author,
      title: ref.title + (ref.subtitle ? `: ${ref.subtitle}` : ''),
      venue: ref['container-title'] || s2.venue || undefined,
      url: s2.url || ref.URL || undefined,
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
    if (node.name !== CITE_LIST) return;
    setValueProperty(node, 'class', CITE_LIST);
    node.children.sort(
      (a, b) => getPropertyValue(a, 'index') - getPropertyValue(b, 'index')
    );
    node.children = node.children
      .map((node, i) => i > 0 ? [ createTextNode(', '), node ] : node)
      .flat();
  });
  return ast;
}

function createBibComponent(refs) {
  const lines = refs.bibliography();
  const list = createComponentNode('ol');
  list.children = lines.map(text => {
    return createComponentNode('li', null, [ createTextNode(text) ]);
  });
  return createComponentNode(CITE_BIB, null, [ list ]);
}
