export function functionConstructor(async, generator) {
  const ctor = fn => Object.getPrototypeOf(fn).constructor;
  return async && generator ? ctor(async function(){})
    : generator ? ctor(function*(){})
    : async ? ctor(async function(){})
    : Function;
}
