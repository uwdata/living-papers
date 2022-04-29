import { Runtime } from '@observablehq/runtime';

export class ObservableRuntime {
  constructor() {
    this.runtime = new Runtime();
    this.main = this.runtime.module();
  }

  redefine(name, defn, inputs = []) {
    this.main.redefine(name, inputs, defn);
  }

  variable(name, defn, inputs = [], observer) {
    this.main.variable(observer).define(name, inputs, defn);
  }

  module(define, inject) {
    const mod = this.runtime.module(define);
    return inject ? mod.derive(inject, this.main) : mod;
  }

  import(from, name, alias = name) {
    this.main.import(name, alias, from);
  }

  value(name) {
    return this.main.value(name);
  }

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

  handler(id) {
    return async (e) => {
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
