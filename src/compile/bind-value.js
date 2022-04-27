import { ObservableRuntime } from '../observable/runtime.js';
import { ObservableCell } from '../components/observable-cell.js';

const runtime = ObservableRuntime.instance();
const contexts = {};

/**
 * Add an input or observable cell to a binding group.
 */
export async function bindValue(name, input, event, valueof) {
  const ctx = await context(name);
  const bind = input instanceof ObservableCell ? bindCell : bindInput;
  bind(ctx, input, event, valueof);
}

/**
 * Add an observable cell value to a binding group.
 */
function bindCell(ctx, cell, event, valueof) {
  let prev;
  cell.addEventListener('change', async () => {
    const next = cell.value;
    if (next === prev) return;
    if (prev) remove(ctx, name, prev);
    bindInput(ctx, prev = next, event, valueof);
  });
}

/**
 * Add an input to a binding group
 */
function bindInput(
  ctx,
  input,
  event = _eventof(input),
  valueof = _valueof
) {
  // set input value to shared variable value
  valueof(input, ctx.value);

  // register bindings
  const listener = () => ctx.enabled && update(ctx, valueof(input));
  ctx.inputs.set(input, { input, event, listener, valueof });
  input.addEventListener(event, listener);
}

/**
 * Get the context object for a binding group.
 * @returns a Promise to the context object.
 */
function context(name) {
  if (!contexts[name]) {
    contexts[name] = runtime.main.value(name)
      .then(value => observe({ name, enabled: true, inputs: new Map, value }));
  }
  return contexts[name];
}

/**
 * Observe a variable cell
 */
 function observe(ctx) {
  runtime.define(ctx.name, {
    fulfilled: (value) => {
      if (ctx.enabled) update(ctx, value);
      ctx.enabled = true;
    }
  });
  return ctx;
}

/**
 * Update the value for a binding group.
 */
function update(ctx, value) {
  if (ctx.value === value) {
    return;
  }

  // update bound inputs as needed
  for (const { input, event, valueof } of ctx.inputs.values()) {
    if (valueof(input) !== value) {
      ctx.enabled = false;
      valueof(input, value);
      input.dispatchEvent(new Event(event));
      ctx.enabled = true;
    }
  }

  // update shared variable
  ctx.enabled = false;
  ctx.value = value;
  runtime.redefine(ctx.name, value);
}

/**
 * Remove an input from a binding group.
 */
 function remove(ctx, input) {
  const { event, listener } = ctx.inputs.get(input);
  input.removeEventListener(event, listener);
  ctx.inputs.delete(input);
}

/**
 * Get/set the state value of an input element.
 */
function _valueof(input, value) {
  if (arguments.length > 1) {
    switch (input.type) {
      case 'date': return (input.valueAsDate = value);
      case 'checkbox': return (input.checked = value);
      default: return (input.value = value);
    }
  } else {
    switch (input.type) {
      case 'range':
      case 'number': return input.valueAsNumber;
      case 'date': return input.valueAsDate;
      case 'checkbox': return input.checked;
      default: return input.value;
    }
  }
}

/**
 * Get the update event type for an input element.
 */
function _eventof(input) {
  switch (input.type) {
    case 'button':
    case 'submit':
    case 'checkbox': return 'click';
    default: return 'input';
  }
}
