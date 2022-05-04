export async function binding(runtime, name) {
  return new Binding(runtime, name, await runtime.value(name));
}

class Binding {
  constructor(runtime, name, value) {
    this.runtime = runtime;
    this.name = name;
    this.value = value;
    this.enabled = true;
    this.inputs = new Map;

    // observe changes to the variable within the runtime
    runtime.variable(null, x => x, [name], {
      fulfilled: value => {
        if (this.enabled) this.update(value);
        else this.enabled = true;
      }
    });
  }

  /**
   * Add an input to the binding group.
   */
  add(input, event = _eventof(input), valueof = _valueof) {
    // set input value to shared variable value
    valueof(input, this.value);

    // register bindings
    const listener = () => this.enabled && this.update(valueof(input));
    this.inputs.set(input, { input, event, listener, valueof });
    input.addEventListener(event, listener);
    return this;
  }

  /**
   * Add a changeable cell value to the binding group.
   */
  addCell(cell, event, valueof) {
    let prev;
    cell.addEventListener('change', async () => {
      const next = cell.value;
      if (next === prev) return;
      if (prev) this.delete(prev);
      this.add(prev = next, event, valueof);
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
   * Update the value of the binding group.
   */
  update(value) {
    if (this.value === value) {
      return;
    }

    // update bound inputs as needed
    for (const { input, event, valueof } of this.inputs.values()) {
      if (valueof(input) !== value) {
        this.enabled = false;
        valueof(input, value);
        input.dispatchEvent(new Event(event));
        this.enabled = true;
      }
    }

    // update shared variable
    this.enabled = false;
    this.value = value;
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
