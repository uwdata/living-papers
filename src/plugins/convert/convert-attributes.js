import { setValueProperty } from '../../ast/index.js';

export default async function(astMap, page, selector) {
  for (const handle of await page.$$(selector)) {
    const result = await handle.evaluate(async el => {
      if (el.observers) {
        // wait for all attributes to resolve, then return
        const observers = Array.from(el.observers.values());
        const values = await Promise.all(observers.map(obs => obs.promise()));
        return {
          id: el.dataset.astId,
          keys: Array.from(el.observers.keys()),
          values
        };
      }
    });

    if (result) {
      // copy attributes to ast
      const { id, keys, values } = result;
      const node = astMap.get(id);
      for (let i = 0; i < keys.length; ++i) {
        setValueProperty(node, keys[i], values[i]);
      }
    }
  }
}
