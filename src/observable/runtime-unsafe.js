import { compile, handler } from './compile.js';
import { _api, _initial, _mutable, _viewof } from './util.js';
import { functionConstructor as Fn } from '../util/function-constructor.js';
import { ObservableRuntime } from './runtime.js';

let _instance;
let _handler_id = 0;

function toFunction(cell) {
  const { async, generator, fnargs, body } = cell;
  return Fn(async, generator)(...fnargs, body);
}

export class UnsafeRuntime extends ObservableRuntime {
  constructor() {
    super();
    this.scopes = new Map();
  }

  static instance() {
    if (!_instance) {
      _instance = new UnsafeRuntime();
    }
    return _instance;
  }

  async load(name) {
    if (!this.scopes.has(name)) {
      const def = await import(_api(name));
      this.scopes.set(name, this.runtime.module(def.default));
    }
    return this.scopes.get(name);
  }

  async dynamicImport(scope, spec) {
    // TODO: viewof, mutable specifiers?
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

  async defineUnsafe(code, observer = undefined, options) {
    const scope = this.main;
    const cell = compile(code, options);
    if (cell.import) {
      await this.dynamicImport(scope, cell.body);
    } else {
      this._defineUnsafe(scope, cell, observer);
    }
  }

  _defineUnsafe(scope, cell, observer) {
    const { viewof, mutable, name, inputs } = cell;
    const defn = toFunction(cell);
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

  handlerUnsafe(expr) {
    const cell = handler(expr, ++_handler_id);
    this._defineUnsafe(this.main, cell);
    return this.handler(cell.name);
  }
}
