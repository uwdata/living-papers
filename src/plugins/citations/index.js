import fs from 'node:fs/promises';
import path from 'node:path';
import {
  createComponentNode, createTextNode, isComponentNode, getPropertyValue,
  getProperties, getProperty, setValueProperty, queryNodes, visitNodes
} from '../../ast/index.js';

import { CitationManager } from './citation-manager.js';
// import * as Scholar from './semantic-scholar.js';

// TODO
// Use newer AST lib, ESM once ready
// Embed citation data as Idyll variable
// Pull data from Semantic Scholar, embed as well.
// Setup caching to avoid DOI, Semantic Scholar, etc., lookups

/*
SEMANTIC SCHOLAR DATA
paperId - Always included
externalIds
url
title - Included if no fields are specified
abstract
venue
year
referenceCount
citationCount
--> authors
--> references

> Citation tooltip
> References: tooltip, links, show other works cited?
*/

const CITEREF = 'cite-ref';
const CITELIST = 'cite-list';

function isCite(node) {
  return isComponentNode(node) && node.name === CITEREF;
}

function updateCite(node, id) {
  setValueProperty(node, 'id', id);
}

export default async function(ast, context) {
  const { INPUT_DIR, metadata } = context;
  // const INPUT_DIR = path.dirname(paths.IDYLL_INPUT_FILE);
  // console.log(INPUT_DIR);

  // reference collection
  const citations = new CitationManager();
  const sources = [];

  if (metadata.bibliography) {
    sources.push.apply(sources, [metadata.bibliography].flat());
  }

  // collect references and citations
  const cites = queryNodes(ast, isCite);

  for (const source of sources) {
    const file = await fs.readFile(path.join(INPUT_DIR, source), 'utf-8');
    await citations.add(file);
  }

  const ids = new Set();
  for (const cite of cites) {
    const props = getProperties(cite);
    if (props.doi) {
      const key = props.doi.value;
      // TODO validate against existing references
      // TODO validate property value type
      // TODO local caching
      // extend bibliography
      const ref = await CitationManager.doi(key);
      const id = ref.id;
      citations.add(ref);
      ids.add(id);
      updateCite(cite, id);
    } else if (props.key) {
      // TODO validate against references
      // TODO validate property value type
      const id = props.key.value;
      ids.add(id);
      updateCite(cite, id);
    } else {
      // TODO warn/error about citation properties
    }
  }

  // filter and sort references
  citations.subset(ids).sort();

  // attempt to resolve semantic scholar ids
  // TODO: local caching
  // TODO: calculate output data for each citation here
  // for (const ref of citations.data()) {
    // console.log(ref.id, ref.S2ID);
    // console.log('LOOKUP',
    //   ref.title,
    //   Object.keys(ref)
    // );

    // const results = ref.DOI
    //   ? { data: [ { paperId: ref.DOI } ], total: 1 }
    //   : await Scholar.lookup(ref);

    // if (results.total > 0) {
    //   ref.ssid = results.data[0].paperId;
    //   ref.ssdata = await Scholar.paper(ref.ssid);
    //   // console.log(ref.id, ref.title, ref.ssid);
    // }
  // }

  // update citation components
  for (const cite of cites) {
    const id = getProperty(cite, 'id').value;
    const ref = citations.get(id);
    const data = {
      title: ref.title + (ref.subtitle ? `: ${ref.subtitle}` : ''),
      author: ref.author,
      year: ref.issued ? ref.issued['date-parts'][0][0] : undefined,
      venue: ref['container-title'],
      doi: ref.DOI || undefined,
      url: ref.URL
    };
    setValueProperty(cite, 'index', citations.indexOf(id));
    setValueProperty(cite, 'data', JSON.stringify(data));
    // setValueProperty(cite, 'ssid', ref.ssid || -1);
    // setValueProperty(cite, 'data', `(${JSON.stringify(ref.ssdata)})`);
    // console.log('CITE', cite.properties.data.value);
  }

  // update reference components
  if (cites.length) {
    ast.children.push(
      createComponentNode(
        'cite-bib',
        null,
        [ createBibliographyList(citations) ]
      )
    );
  }
  // for (const refs of references) {
  //   refs.children = [
  //     outputReferences(citations)
  //   ];
  // }

  // TODO: make sorting optional
  return sortCitationLists(ast);
}

function sortCitationLists(ast) {
  visitNodes(ast, node => {
    if (node.name !== CITELIST) return;
    node.children.sort(
      (a, b) => getPropertyValue(a, 'index') - getPropertyValue(b, 'index')
    );
  });
  return ast;
}

function createBibliographyList(refs) {
  const data = refs.data();
  const lines = refs.bibliography();
  const list = createComponentNode('ol');

  list.children = lines.map((text, index) => {
    const li = createComponentNode('li', null, [ createTextNode(text) ]);
    // const { url } = data[index].ssdata;
    // const props = createProperties({ href: url });
    // li.children = [
    //   createComponentNode('a', props, [ createTextNode(text) ])
    // ];
    return li;
  });

  return list;
}
