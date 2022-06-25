import { setValueProperty } from '../../ast/index.js';

export async function convertProperties(handle, node) {
  const result = await handle.evaluate(async el => {
    if (el.observers) {
      // wait for all attributes to resolve, then return
      const attrs = Array.from(el.observers.values());
      return {
        keys: Array.from(el.observers.keys()),
        values: await Promise.all(attrs.map(obs => obs.promise()))
      };
    }
  });

  if (result) {
    // copy attributes to ast
    const { keys, values } = result;
    for (let i = 0; i < keys.length; ++i) {
      setValueProperty(node, keys[i], values[i]);
    }
  }
}
