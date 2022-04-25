import { parseCell } from '@observablehq/parser';
import { functionConstructor as Fn } from '../util/function-constructor.js';

export function compile(code, options) {
  // parse observable cell code
  const cell = parseCell(code);

  // if import, return cell body for processing
  if (cell.body.type === 'ImportDeclaration') {
    return { import: true, body: cell.body };
  }

  // return compiled code plus metadata
  const id = cell.id || {};
  const viewof = id.type === 'ViewExpression';
  const mutable = id.type === 'MutableExpression';
  const name = viewof || mutable ? id.id.name : id.name;
  return { viewof, mutable, name, ...codegen(code, cell, options) };
}

export function codegen(code, cell, options = {}) {
  let mrefid = 0;          // id counter for mutable variables
  const mref = [];         // mutable variable references
  const mmap = new Map();  // map mutable variables to new identifiers
  const seen = new Set();  // tracks if a dependency was already seen
  const inputs = [];       // runtime inputs to register
  const fnargs = [];       // generated function arguments

  // analyze dependencies, track mutable variables
  for (const ref of cell.references) {
    let input, fnarg;
    if (ref.type === 'MutableExpression') {
      mref.push(ref);
      input = `mutable ${ref.id.name}`;
      if (seen.has(input)) continue;
      fnarg = `$${mrefid++}`;
      mmap.set(ref.id.name, fnarg);
    } else {
      input = fnarg = ref.name;
      if (seen.has(input)) continue;
    }
    inputs.push(input);
    fnargs.push(fnarg);
    seen.add(input);
  }

  // extract body code for compilation
  const { async, generator } = cell;
  const { start, end, type } = cell.body;
  let body = code.slice(start, end);

  // rewrite references to mutable variables
  // work backwards to preserve accurate indices
  for (let i = mref.length; --i >= 0;) {
    const key = mref[i].id.name;
    const value = mmap.get(key);
    body = body.slice(0, mref[i].start - start)
      + `${value}.value`
      + body.slice(mref[i].end - start);
  }

  // prepare code for function constructor
  body = type === 'BlockStatement'
    ? body.slice(1, -1)
    : `return(\n${body}\n)`;

  // apply code transform if provided
  if (options.transform) {
    body = options.transform(body, cell);
  }

  // return raw code if requested
  if (options.raw) {
    return { inputs, fnargs, body, async, generator };
  }

  // return compiled code
  return {
    inputs,
    defn: Fn(async, generator)(...fnargs, body)
  };
}
