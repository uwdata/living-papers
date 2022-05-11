import {
  createComponentNode, createProperties, getPropertyValue, hasProperty
} from '../../ast/index.js';

const Bool = v => !v || (v+'').toLowerCase() === 'false'
  ? 'FALSE'
  : 'TRUE';

const Str = v => `'${v}'`;

const OPTIONS = new Map([
  ['collapse', { name: 'collapse', default: true, type: Bool }],
  ['comment', { name: 'comment', default: '', type: Str }],
  ['keep', { name: 'fig.keep', default: 'last', type: Str }],
  ['figwidth', { name: 'fig.width', default: 7.5, type: Number }],
  ['figheight', { name: 'fig.height', default: 7.5, type: Number }],
  ['asp', { name: 'fig.asp', default: null, type: Number }],
  ['dpi', { name: 'dpi', default: 144, type: Number }],
  ['dev', { name: 'dev', default: 'png', type: Str }],
  ['alt', { name: 'fig.alt', default: null, type: Str }]
]);

function getChunkOptions(node, applyDefaults = false) {
  const opt = [];
  for (const [name, def] of OPTIONS) {
    const has = hasProperty(node, name);
    if (has || applyDefaults) {
      const val = has ? getPropertyValue(node, name) : def.default;
      opt.push(`${def.name} = ${val == null ? 'NULL' : def.type(val)}`);
    }
  }
  return opt;
}

export function generateChunk(node, index) {
  const code = node.children[0].value;
  if (node.name === 'code') {
    return `\`${code}\``;
  } else {
    const opt = getChunkOptions(node).join(', ');
    const l = `rmd${index}`;
    // attr.output = 'label="${l}"',
    return `\`\`\`{r, label = '${l}', ${opt}}\n${code}\n\`\`\``;
  }
}

export function generateRMarkdown(knitr, blocks) {
  const node = createComponentNode('?', createProperties(knitr));
  return `\`\`\`{r, setup, include=FALSE}
knitr::opts_chunk$set(
  echo = FALSE,
  ${getChunkOptions(node, true).join(',\n  ')}
)
\`\`\`\n\n` + blocks.join('\n\n');
}

export function generateRScript() {
  return `library(knitr)
args <- commandArgs(trailingOnly = TRUE)
knit(args[1])`;
}
