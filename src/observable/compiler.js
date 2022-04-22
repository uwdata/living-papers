import { parseCell } from '@observablehq/parser';

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
const GeneratorFunction = Object.getPrototypeOf(function*(){}).constructor;
const AsyncGeneratorFunction = Object.getPrototypeOf(async function*(){}).constructor;

const ViewExpression = 'ViewExpression';
const MutableExpression = 'MutableExpression';
const ImportDeclaration = 'ImportDeclaration';
// const ImportSpecifier = 'ImportSpecifier';

export function compile(code, raw = false) {
  const cell = parseCell(code);
  if (cell.body.type === ImportDeclaration) {
    return { import: true, body: cell.body };
  }

  const id = cell.id || {};
  const viewof = id.type === ViewExpression;
  const mutable = id.type === MutableExpression;
  const name = viewof || mutable ? id.id.name : id.name;
  return { viewof, mutable, name, ...codegen(code, cell, raw) };
}

export function codegen(code, cell, raw) {
  let mrefid = 0;
  const mrefs = new Map();
  const seen = new Set();
  const inputs = [];
  const fnargs = [];

  for (const ref of cell.references) {
    let input, fnarg;
    if (ref.type === MutableExpression) {
      input = `mutable ${ref.id.name}`;
      fnarg = `$${mrefid++}`;
      mrefs.set(ref.id.name, fnarg);
    } else {
      input = fnarg = ref.name;
    }
    if (!seen.has(input)) {
      inputs.push(input);
      fnargs.push(fnarg);
      seen.add(input);
    }
  }

  const { start, end, type } = cell.body;
  let body = code.slice(start, end);
  if (mrefs.size) {
    // TODO: code generation rather than string patching
    for (const [key, value] of mrefs) {
      body = body.replaceAll(`mutable ${key}`, `${value}.value`);
    }
  }
  body = type === 'BlockStatement' ? body.slice(1, -1) : `return(\n${body}\n)`;

  if (raw) {
    return { inputs, fnargs, body, async: cell.async, generator: cell.generator };
  }

  const Fn = cell.async
    ? (cell.generator ? AsyncGeneratorFunction : AsyncFunction)
    : (cell.generator ? GeneratorFunction : Function);
  return { inputs, defn: Fn(...fnargs, body) };
}
