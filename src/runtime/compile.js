import { parseCell, walk } from '@observablehq/parser';
import { simple } from 'acorn-walk';
import { splice } from '../util/splice.js';

const PROXY = '__proxy__';

export function compile(code, options = {}) {
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

function codegen(code, cell, options = {}) {
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
    const { id, start: r0, end: r1 } = mref[i];
    const value = mmap.get(id.name);
    body = splice(body, `${value}.value`, r0 - start, r1 - start);
  }

  // prepare code for function constructor
  body = type === 'BlockStatement'
    ? body.slice(1, -1)
    : `return(\n${body}\n)`;

  // apply code transform if provided
  if (options.transform) {
    body = options.transform(body, cell, inputs, fnargs);
  }

  // return raw code if requested
  return { inputs, fnargs, body, async, generator };
}

export function handler(expr, idx) {
  // Define event handler function within the Observable runtime.
  // We rewrite the expr to proxy any assigned identifiers, and
  // transform generated code to produce a handler function.
  const { code, vars } = rewrite(expr);
  return compile(`__event${idx}__ = ${code}`, {
    transform: (...args) => generate(vars, ...args)
  });
}

// Transform generated code to produce an event handler
function generate(vars, code, cell, inputs, fnargs) {
  if (cell.generator) {
    throw new Error('Event handlers can not be generator functions.');
  }
  switch (cell.body.type) {
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
    case 'FunctionDeclaration':
      break;
    default:
      // if not function-valued, wrap in a function with event argument
      drop('event', inputs, fnargs);
      code = `return(\n${cell.async ? 'async ': ''}(event) => {${code}}\n)`;
  }
  // wrap handler in a function that takes proxy argument
  drop(PROXY, inputs, fnargs);
  return `return([\n${PROXY} => {${code}},\n${JSON.stringify(vars)}\n])`;
}

// Drop cell inputs that are passed as external arguments
function drop(name, inputs, fnargs) {
  const index = inputs.indexOf(name);
  if (index >= 0) {
    inputs.splice(index, 1);
    fnargs.splice(index, 1);
  }
}

// Rewrite assignment expressions to use an injected proxy
// (x = 5) ==> (__proxy__.x = 5)
function rewrite(expr) {
  const pattern = /Assignment to constant variable ([^ ]+)/;
  const ids = new Set;

  // Identify top-level assignment expressions within the code.
  // We *could* parse directly (with adjustments for Observable keywords),
  // but here we instead leverage the Observable parser's error handling.
  // Parse errors identify top-level variable assignments for us. It is a
  // bit annoying that we have to parse repeatedly to gather assignments
  // one by one, but in practice we shouldn't have many assignments (and
  // this is a one-time operation), so performance should be acceptable.
  let done = false;
  let code = expr;
  let cell;
  let args = '';
  do {
    code = `(${args})=>{${expr}}`; // add variable declarations
    try {
      cell = parseCell(code);
      done = true;
    } catch (err) {
      const match = err.message.match(pattern);
      if (!match) { done = true; break; }
      ids.add(match[1]);
      args += (args.length ? ',' : '') + match[1];
    }
  } while (!done);

  // walk ast and collect assigned identifier locations
  // TODO: support nested scopes?
  const idx = [];
  simple(
    cell.body.body,
    {
      VariablePattern: (node) => {
        if (node.type === 'Identifier' && ids.has(node.name)) {
          idx.push(node.start);
        }
      },
      Identifier: (node) => {
        if (ids.has(node.name)) {
          idx.push(node.start);
        }
      }
    },
    walk
  );

  // inject proxy for assigned identifiers
  idx.reverse().forEach(i => { code = splice(code, `${PROXY}.`, i) });

  // strip variable declaration boilerplate from code
  return { code: code.slice(4 + args.length), vars: [...ids] };
}
