import {
  createComponentNode, createProperties, getPropertyValue, hasProperty
} from '../../ast/index.js';

const Bool = v => v && (v+'').toLowerCase() !== 'false' ? 'TRUE' : 'FALSE';
const Str = v => `'${v}'`;

const OPTIONS = new Map([
  ['collapse', { name: 'collapse', default: false, valueOf: Bool }],
  ['comment', { name: 'comment', default: '', valueOf: Str }],
  ['keep', { name: 'fig.keep', default: 'last', valueOf: Str }],
  ['figwidth', { name: 'fig.width', default: 7.5, valueOf: Number }],
  ['figheight', { name: 'fig.height', default: 7.5, valueOf: Number }],
  ['asp', { name: 'fig.asp', default: null, valueOf: Number }],
  ['dpi', { name: 'dpi', default: 144, valueOf: Number }],
  ['dev', { name: 'dev', default: 'png', valueOf: Str }],
  ['alt', { name: 'fig.alt', default: null, valueOf: Str }]
]);

function getChunkOptions(node, applyDefaults = false) {
  const opt = [];

  if (Bool(getPropertyValue(node, 'hide')) === 'TRUE') {
    opt.push(`include = FALSE`);
  }

  for (const [name, def] of OPTIONS) {
    const has = hasProperty(node, name);
    if (has || applyDefaults) {
      const val = has ? getPropertyValue(node, name) : def.default;
      opt.push(`${def.name} = ${val == null ? 'NULL' : def.valueOf(val)}`);
    }
  }

  return opt;
}

export function generateChunk(node, index) {
  const code = node.children[0].value;
  if (node.name === 'code') {
    return `\`${code}\``;
  } else {
    const l = `r${index}`;
    const opt = [
      'r',
      `label = '${l}'`,
      `attr.output = 'type="output"'`,
      `attr.message = 'type="info"'`,
      `attr.warning = 'type="warn"'`,
      `attr.error = 'type="error"'`,
      ...getChunkOptions(node)
    ].join(', ');
    return `\`\`\`{${opt}}\n${code}\n\`\`\``;
  }
}

export function generateRMarkdown(knitr, blocks) {
  const node = createComponentNode('?', createProperties(knitr));
  const imports = knitr.import || [];
  return `\`\`\`{r, setup, include=FALSE}
knitr::opts_chunk$set(
  echo = FALSE,
  ${getChunkOptions(node, true).join(',\n  ')}
)${ imports.map(lib => `\nlibrary(${lib})`).join('') }
\`\`\`\n\n` + blocks.join('\n\n');
}

export function generateRScript() {
  return `library(knitr)
args <- commandArgs(trailingOnly = TRUE)
knit(args[1])`;
}
