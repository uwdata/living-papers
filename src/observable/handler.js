import { parseCell, walk } from '@observablehq/parser';
import { simple } from 'acorn-walk';
import { splice } from '../util/splice.js';

const PROXY = '__proxy__';
let handler_id = 0;

export function eventHandler(runtime, expr) {
  // Define event handler function within the Observable runtime.
  // We first rewrite expr to proxy any assignment statements,
  // we then transform generated code to produce a handler function.
  const id = `__event_${++handler_id}__`;
  const observer = {
    rejected(err) {
      console.error('Event handler error.', err);
    }
  };
  runtime.define(`${id} = ${rewrite(expr)}`, observer, { transform });

  // Return the resulting event handler function.
  // We retrieve the handler from the runtime, invoke it for the
  // current event and assignment proxy, then apply any proxied
  // changes back to the runtime by redefining those cells.
  return (
    async (e) => {
      const proxy = Object.create(null);
      (await runtime.value(id))(proxy)(e);
      for (const name in proxy) {
        runtime.value(name).then(v => {
          if (v !== proxy[name]) {
            runtime.redefine(name, proxy[name]);
          }
        });
      }
    }
  );
}

// Transform generated code to produce an event handler
function transform(code, cell, inputs, fnargs) {
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
  // wrap in a function that takes a proxy as argument
  drop(PROXY, inputs, fnargs);
  return `return(${PROXY} => {${code}})`;
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

  // walk ast and collect assignment identifier locations
  const idx = [];
  simple(
    cell.body,
    {
      AssignmentExpression: ({ left }) => {
        if (left.type === 'Identifier' && ids.has(left.name)) {
          idx.push(left.start);
        }
      }
    },
    walk
  );

  // inject proxy for assignment statements
  idx.reverse().forEach(i => { code = splice(code, `${PROXY}.`, i) });

  // strip variable declaration boilerplate from code
  return code.slice(5 + args.length, -1);
}
