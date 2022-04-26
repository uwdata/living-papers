import { Runtime } from '@observablehq/runtime';
import { compile } from './compile.js';
import { _api, _initial, _mutable, _viewof } from './util.js';

let _instance;

export class ObservableRuntime {
  constructor() {
    this.runtime = new Runtime();
    this.main = this.runtime.module();
    this.scopes = new Map();
  }

  static instance() {
    if (!_instance) {
      _instance = new ObservableRuntime();
    }
    return _instance;
  }

  redefine(name, value, inputs = []) {
    this.main.redefine(name, inputs, value);
  }

  async load(name) {
    if (!this.scopes.has(name)) {
      const def = await import(_api(name));
      this.scopes.set(name, this.runtime.module(def.default));
    }
    return this.scopes.get(name);
  }

  // TODO: viewof, mutable specifiers
  async import(scope, spec) {
    const { source, injections, specifiers } = spec;
    const inject = (injections || []).map(s => {
      const name = s.imported.name;
      const alias = s.local.name;
      return name === alias ? name : { name, alias };
    });

    const mod = (await this.load(source.value)).derive(inject, scope);

    specifiers.forEach(({ imported, local }) => {
      scope.import(imported.name, local.name, mod);
    });
  }

  async define(cellCode, observer = undefined, options) {
    const scope = this.main;
    const cell = compile(cellCode, options);

    if (cell.import) {
      await this.import(scope, cell.body);
      return;
    }

    const { viewof, mutable, name, inputs, defn } = cell;
    if (viewof) {
      scope.variable(observer).define(_viewof(name), inputs, defn);
      scope.variable().define(name, ['Generators', _viewof(name)], (G, _) => G.input(_));
    } else if (mutable) {
      scope.define(_initial(name), inputs, defn);
      scope.variable().define(_mutable(name), ['Mutable', _initial(name)], (M, _) => new M(_));
      scope.variable(observer).define(name, [_mutable(name)], _ => _.generator);
    } else if (name) {
      scope.variable(observer).define(name, inputs, defn);
    } else {
      scope.variable(observer).define(inputs, defn);
    }
  }
}
