import {
  extractText, getPropertyValue, hasClass, queryNode, queryNodes, setParentNodes
} from '@living-papers/ast';

const ABSTRACT = 'abstract';
const CITEREF = 'citeref';
const FIGURE = 'figure';
const TEASER = 'teaser';
const CAPTION = 'caption';
const TABLE = 'table';
const EQUATION = 'equation';

const isFigureNode = node => node.name === FIGURE
  && (hasClass(node, FIGURE) || hasClass(node, TEASER));
const isTableNode = node => node.name === FIGURE && hasClass(node, TABLE);
const isCaptionNode = node => node.name === CAPTION;
const isEquationNode = node => node.name === EQUATION;

/**
 * Extract information from a Living Papers article.
 */
export class ArticleAPI {
	constructor(ast) {
    this.metadata = ast.metadata;
    this.article = ast.article;
    this.data = ast.data;
    this.citations = this.data?.citations;

    // ensure all nodes have parentNode properties
    setParentNodes(this.article);
  }

  queryNode(predicate) {
    return queryNode(this.article, predicate);
  }

  queryNodes(predicate) {
    return queryNodes(this.article, predicate);
  }

  get title() {
    return this.metadata.title;
  }

  get author() {
    return this.metadata.author;
  }

  authorField(field) {
    const list = Array.isArray(this.author) ? this.author
      : this.author ? [this.author]
      : [];
    return list.map(author => author[field]);
  }

  get authorNames() {
    return this.authorField('name');
  }

  get year() {
    return this.metadata.year;
  }

  get venue() {
    return this.metadata.venue;
  }

  get doi() {
    return this.metadata.doi;
  }

  get abstractNode() {
    return this.queryNode(node => node.name === ABSTRACT);
  }

  get abstract() {
    return extractText(this.abstractNode);
  }

  get references() {
    return this.citations?.data;
  }

  get referencesCSL() {
    return this.citations?.csl;
  }

  get referencesBibtex() {
    return this.citations?.bibtex;
  }

  get citationNodes() {
    return this.queryNodes(node => node.name === CITEREF);
  }

  get figureNodes() {
    return this.queryNodes(isFigureNode);
  }

  get figureCaptionNodes() {
    return this.figureNodes.map(node => queryNode(node, isCaptionNode));
  }

  get tableNodes() {
    return this.queryNodes(isTableNode);
  }

  get tableCaptionNodes() {
    return this.tableNodes.map(node => queryNode(node, isCaptionNode));
  }

  get equationNodes() {
    return this.queryNodes(isEquationNode);
  }

  get equationText() {
    return this.equationNodes.map(node => extractText(node));
  }

  figureImage(index) {
    const node = this.figureNodes[index];
    return node && getPropertyValue(node, 'data-url');
  }

  tableImage(index) {
    const node = this.tableNodes[index];
    return node && getPropertyValue(node, 'data-url');
  }

  equationImage(index) {
    const node = this.equationNodes[index];
    return node && getPropertyValue(node, 'data-url');
  }

  figureCaption(index) {
    const node = this.figureNodes[index];
    return node && getPropertyValue(node, 'data-caption') || null;
  }

  tableCaption(index) {
    const node = this.tableNodes[index];
    return node && getPropertyValue(node, 'data-caption') || null;
  }
}
