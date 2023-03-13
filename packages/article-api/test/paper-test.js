import assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import { queryNode } from '@living-papers/ast';
import { ArticleAPI } from '../src/index.js';

let ast;
let api;

describe('Paper', () => {
  before(async () => {
    ast = JSON.parse(await readFile('test/data/fast-kde.ast.json'));
    api = new ArticleAPI(ast);
  });

  after(() => { ast = api = null; });

  it('exposes metadata fields', () => {
    const { metadata } = ast;
    const { author } = metadata;
    assert.strictEqual(api.title, metadata.title);
    assert.strictEqual(api.doi, metadata.doi);
    assert.strictEqual(api.year, metadata.year);
    assert.strictEqual(api.venue, metadata.venue);
    assert.deepStrictEqual(api.authorNames, author.map(a => a.name));
    assert.deepStrictEqual(api.authorField('orcid'), author.map(a => a.orcid));
  });

  it('exposes references', () => {
    const { data: { citations } } = ast;
    const { bibtex, csl, data } = citations;
    assert.strictEqual(api.referencesBibtex.length, bibtex.length);
    assert.strictEqual(api.referencesCSL.length, csl.length);
    assert.strictEqual(api.references.length, data.length);
    assert.strictEqual(api.referencesBibtex[0], bibtex[0]);
    assert.deepStrictEqual(api.referencesCSL[0], csl[0]);
    assert.deepStrictEqual(api.references[0], data[0]);
  });

  it('extracts abstract', () => {
    const node = queryNode(ast.article, n => n.name === 'abstract');
    assert.ok(api.abstract);
    assert.ok(api.abstract.startsWith(node.children[0].children[0].value)); // abstract -> p -> textnode
    assert.strictEqual(api.abstractNode, node);
  });
});
