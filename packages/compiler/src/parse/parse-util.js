import { getPropertyValue } from '@living-papers/ast';
import {
  SoftBreak, Space, Str,
  SingleQuote, DoubleQuote,
  DisplayMath, InlineMath,
  Decimal, LowerAlpha, UpperAlpha, LowerRoman, UpperRoman,
  Period, OneParen, TwoParens,
  AlignLeft, AlignRight, AlignCenter, AlignDefault,
  NormalCitation, AuthorInText, SuppressAuthor
} from './pandoc-types.js';

export function append(array, items) {
  array.push(...items);
}

export function extractText(blocks) {
  return (blocks || []).map(block => {
    const { t: type, c: content } = block;
    switch (type) {
      case Str: return content;
      case Space: return ' ';
      case SoftBreak: return '\n';
      default: return extractText(content);
    }
  }).join('');
}

export function isDisplayMath(node) {
  return node.name === 'math'
      && getPropertyValue(node, 'mode') === 'display';
}

export function isInterpolated(text) {
  return /\$\{.*\}/.test(text);
}

export function getQuoteType(type) {
  switch (type) {
    case SingleQuote: return 'single';
    case DoubleQuote: return undefined;
    default:
      throw new Error(`Unrecognized quote type: ${type}.`);
  }
}

export function getMathType(type) {
  switch (type) {
    case DisplayMath: return 'display';
    case InlineMath: return 'inline';
    default:
      throw new Error(`Unrecognized math type: ${type}.`);
  }
}

export function getListType(type) {
  switch (type) {
    case Decimal: return undefined; // default, '1'
    case LowerAlpha: return 'a';
    case UpperAlpha: return 'A';
    case LowerRoman: return 'i';
    case UpperRoman: return 'I';
    default:
      throw new Error(`Unrecognized list type: ${type}.`);
  }
}

export function getMarkerType(type) {
  switch (type) {
    case Period: return undefined; // default, '.'
    case OneParen: return ')';
    case TwoParens: return '()';
    default:
      throw new Error(`Unrecognized list marker type: ${type}.`);
  }
}

export function getTableCellAlign(align) {
  switch (align) {
    case AlignLeft: return ['left'];
    case AlignRight: return ['right'];
    case AlignCenter: return ['center'];
    case AlignDefault: return [];
    default:
      throw new Error(`Unrecognized align type: ${align}.`);
  }
}

export function getCiteMode(mode) {
  switch (mode) {
    case NormalCitation: return undefined;
    case AuthorInText: return 'inline-author';
    case SuppressAuthor: return 'suppress-author';
    default:
      throw new Error(`Unrecognized citation mode: ${mode}.`);
  }
}
