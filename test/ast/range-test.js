import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRange, queryRange } from '../../src/ast/index.js';

const { article: ast } = JSON.parse(readFileSync(
  fileURLToPath(new URL(`../data/ast/basic.ast.json`, import.meta.url)),
  'utf8'
));

describe('queryRange', () => {
  it('over collapsed selection', () => {
    assert.deepStrictEqual(
      queryRange(ast, createRange([1, 1, 0], 1, [1, 1, 0], 1)),
      {
        "type": "textnode",
        "value": ""
      }
    );
  });

  it('over non-text nodes', () => {
    assert.deepStrictEqual(
      queryRange(ast, createRange([1], null, [1], null)),
      ast.children[1]
    );

    assert.deepStrictEqual(
      queryRange(ast, createRange([1], null, [2], null)),
      {
        type: "component",
        name: "article",
        children: ast.children.slice(1, 3)
      }
    );
  });

  it('over text nodes without offsets', () => {
    assert.deepStrictEqual(
      queryRange(ast, createRange([1, 0], null, [1, 1], null)),
      {
        type: "component",
        name: "p",
        children: ast.children[1].children.slice(0, 2)
      }
    );
  });

  it('over same node with offsets', () => {
    assert.deepStrictEqual(
      queryRange(ast, createRange([1, 1, 0], 1, [1, 1, 0], 6)),
      {
        "type": "textnode",
        "value": "talic"
      }
    );
  });

  it('over different nodes with offsets', () => {
    assert.deepStrictEqual(
      queryRange(ast, createRange([1, 1, 0], 4, [2, 0], 8)),
      {
        "type": "component",
        "name": "article",
        "children": [
          {
            "type": "component",
            "name": "p",
            "children": [
              {
                "type": "component",
                "name": "em",
                "children": [
                  {
                    "type": "textnode",
                    "value": "ics"
                  }
                ]
              },
              {
                "type": "textnode",
                "value": ", "
              },
              {
                "type": "component",
                "name": "strong",
                "children": [
                  {
                    "type": "textnode",
                    "value": "bold"
                  }
                ]
              },
              {
                "type": "textnode",
                "value": ", "
              },
              {
                "type": "component",
                "name": "strong",
                "children": [
                  {
                    "type": "component",
                    "name": "em",
                    "children": [
                      {
                        "type": "textnode",
                        "value": "both"
                      }
                    ]
                  }
                ]
              },
              {
                "type": "textnode",
                "value": ".\nand some code "
              },
              {
                "type": "component",
                "name": "code",
                "children": [
                  {
                    "type": "textnode",
                    "value": "x = Math.PI * r * r"
                  }
                ]
              },
              {
                "type": "textnode",
                "value": "."
              }
            ]
          },
          {
            "type": "component",
            "name": "p",
            "children": [
              {
                "type": "textnode",
                "value": "Here is "
              }
            ]
          }
        ]
      }
    );
  });
});