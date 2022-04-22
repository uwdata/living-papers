import { Runtime } from '@observablehq/runtime';
import { compile } from './compiler.js';

const MAIN_SCOPE = '__main__';
const _viewof = name => `viewof ${name}`;
const _mutable = name => `mutable ${name}`;
const _initial = name => `initial ${name}`;

let _Runtime;

export class ObservableRuntime {
  constructor() {
    this.runtime = new Runtime();
    this.main = this.runtime.module();
    this.scopes = new Map();
  }

  static instance() {
    if (!_Runtime) {
      _Runtime = new ObservableRuntime();
    }
    return _Runtime;
  }

  redefine(name, value, inputs = []) {
    this.main.redefine(name, inputs, value);
  }

  async load(name) {
    if (!this.scopes.has(name)) {
      const def = await import(`https://api.observablehq.com/${name}.js?v=3`);
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

  async define(cellCode, observer = undefined) {
    const scope = this.main;
    const cell = compile(cellCode);

    if (cell.import) {
      await this.import(scope, cell.body);
      return;
    }

    const { viewof, mutable, name, inputs, defn } = cell;
    if (viewof) {
      scope.variable(observer).define(_viewof(name), inputs, defn);
      scope.variable().define(name, ['Generators', _viewof(name)], (G, _) => G.input(_));
    } else if (mutable) {
      // TODO what about inputs?
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
