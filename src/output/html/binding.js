export async function binding(runtime, name) {
  return new Binding(runtime, name, await runtime.value(name));
}

function onNextTick(f) {
  typeof window !== 'undefined' && window.requestAnimationFrame
    ? window.requestAnimationFrame(f)
    : setTimeout(f, 0);
}

class Binding {
  constructor(runtime, name, value) {
    this.runtime = runtime;
    this.name = name;
    this.value = value;
    this.paused = false;
    this.ignore = null;
    this.queued = [];
    this.inputs = new Map;

    // observe changes to the variable within the runtime
    runtime.variable(null, x => x, [name], {
      fulfilled: value => this.paused ? this.dequeue() : this.update(value)
    });
  }

  /**
   * Add an input to the binding group.
   */
  add(input, {
    override = false,
    event = _eventof(input),
    valueof = _valueof
  } = {}) {
    if (override) {
      // set bound variable value to the input value
      this.update(valueof(input));
    } else {
      // set input value to the bound variable value
      valueof(input, this.value);
    }

    // register bindings
    const listener = () => this.queue(input, valueof(input));
    this.inputs.set(input, { input, event, listener, valueof });
    input.addEventListener(event, listener);
    return this;
  }

  /**
   * Add a changeable cell value to the binding group.
   */
  addCell(cell, options) {
    let prev;
    cell.addEventListener('change', async () => {
      const next = cell.value;
      if (next === prev) return;
      if (prev) this.delete(prev);
      this.add(prev = next, options);
    });
    return this;
  }

  /**
   * Delete an input from the binding group.
   */
  delete(input) {
    const { event, listener } = this.inputs.get(input);
    input.removeEventListener(event, listener);
    this.inputs.delete(input);
  }

  /**
   * Queue requested changes to the bound variable value.
   * Process events on next tick. This lets us to debounce
   * multiple events arriving on the same tick.
   */
  queue(input, value) {
    if (this.ignore !== input) {
      if (!this.paused && !this.queued.length) {
        onNextTick(() => this.dequeue())
      }
      this.queued.push(value);
    }
  }

  /**
   * Clear request queue, process only most recent entry.
   */
  dequeue() {
    this.paused = false;
    if (this.queued.length) {
      const queue = this.queued;
      this.queued = [];
      this.update(queue.pop());
    }
  }

  /**
   * Update the value of the binding group.
   */
  update(value) {
    if (this.value === value) return;
    this.value = value;
    this.paused = true;

    // update bound inputs as needed
    for (const { input, event, valueof } of this.inputs.values()) {
      if (valueof(input) !== value) {
        this.ignore = input;
        valueof(input, value);
        input.dispatchEvent(new Event(event));
        this.ignore = null;
      }
    }

    // update shared variable
    this.runtime.redefine(this.name, value);
  }
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
