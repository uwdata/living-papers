import { getAstId } from './get-ast-id.js';
import toImage from './to-image.js';

export default async function(astMap, page, selector, options) {
  for (const handle of await page.$$(selector)) {
    const astId = await getAstId(handle);
    const node = astMap.get(astId);

    // wait for element to be ready
    const isText = await handle.evaluate(async el => {
      if (el.observers) {
        const observers = Array.from(el.observers.values());
        await Promise.all(observers.map(obs => obs.promise()));
      } else if (el.observer) {
        const value = await el.observer.promise();
        const type = typeof value;
        return type === 'string' || type === 'number';
      }
    });

    // TODO: handle HTML that can be converted to AST
    if (isText) {
      node.type = 'textnode';
      node.value = await handle.evaluate(el => el.innerText);
      delete node.name;
      delete node.properties;
      delete node.children;
    } else {
      await toImage(astId, node, handle, options);
    }
  }
}
