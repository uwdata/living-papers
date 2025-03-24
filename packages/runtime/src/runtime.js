import { Runtime } from '@observablehq/runtime';
import { Library } from '@observablehq/stdlib';
import { FileAttachment } from './file-attachment.js';

/**
 * Reactive runtime engine.
 */
export class ObservableRuntime {
  /**
   * Create a new runtime instance.
   */
  constructor() {
    // Prepare a standard library instance
    const lib = Object.assign(new Library, {
      FileAttachment: () => FileAttachment
    });

    /**
     * Instantiate an Observable runtime instance.
     */
    this.runtime = new Runtime(lib);

    /**
     * The main module (variable namespace).
     */
    this.main = this.runtime.module();
  }

  /**
   * Redefine a variable in the runtime.
   * @param {string} name The name of the variable.
   * @param {function} defn A function that returns the variable value.
   * @param {any[]} [inputs] The inputs to the definition function.
   */
  redefine(name, defn, inputs = []) {
    this.main.redefine(name, inputs, defn);
  }

  /**
   * Define a new variable in the runtime.
   * @param {string} name The name of the variable.
   * @param {function} defn A function that returns the variable value.
   * @param {any[]} inputs The inputs to the definition function.
   * @param {*} [observer] An observer instance that receives updates
   *  as the variable status changes.
   */
  variable(name, defn, inputs = [], observer) {
    this.main.variable(observer).define(name, inputs, defn);
  }

  /**
   * Instatiate an external module (namespace) in the runtime.
   * If injection values are provided, a derived module will be
   * created with injected variables from the main modulde.
   * @param {function} define The module definition function.
   * @param {object} [inject] An array of {name, alias} objects
   *  indicating variables to inject from the main module.
   * @returns The new module.
   */
  module(define, inject) {
    const mod = this.runtime.module(define);
    return inject ? mod.derive(inject, this.main) : mod;
  }

  /**
   * Import variables from an external module into the main module.
   * @param {object} from The module to import from.
   * @param {string} name The source name of the variable to import.
   * @param {string} alias The alias (target name) for the imported variable.
   */
  import(from, name, alias = name) {
    this.main.import(name, alias, from);
  }

  /**
   * Request the value for a named variable in the runtime.
   * @param {string} name The variable name.
   * @returns {Promise} A Promise for the variable value.
   */
  value(name) {
    return this.main.value(name);
  }

  /**
   * Define a set of variables in the main module.
   * @param {object[]} defs An array of variable definition objects.
   * @param {function} observer A function to call to get an observer
   *  instance for a variable.
   */
  define(defs, observer) {
    const mods = new Map;
    defs.forEach(def => {
      if (def.module) {
        const [id, define, inject] = def.module;
        mods.set(id, this.module(define, inject));
      } else if (def.import) {
        const [id, name, alias] = def.import;
        this.import(mods.get(id), name, alias);
      } else if (def.define) {
        const [name, inputs, defn] = def.define;
        this.variable(name, defn, inputs, observer(def));
      }
    });
  }

  /**
   * Generate an event handler function for a named assignment handler in the
   * runtime. The event handler collects all assignments to a proxy object
   * and propagates the assignments to the runtime by redefining variables.
   * @param {string} id The handler id (variable name).
   * @returns {function} The generated event handler.
   */
  handler(id) {
    return async (e) => {
      // prevent default event response
      e.preventDefault();

      // retrieve handler and variables from runtime
      const [handler, vars] = await this.value(id);
      const values = await Promise.all(vars.map(name => this.value(name)));

      // populate proxy object with variable values
      const proxy = Object.create(null);
      values.forEach((value, i) => proxy[vars[i]] = value);

      // invoke event handler
      await handler(proxy)(e);

      // propagate proxied assignments back to the runtime
      values.forEach((value, i) => {
        const name = vars[i];
        if (value !== proxy[name]) {
          this.redefine(name, proxy[name]);
        }
      });
    }
  }
}
