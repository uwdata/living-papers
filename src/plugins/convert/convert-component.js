import { convertImage } from './convert-image.js';

export async function convertComponent(handle, node, options) {
  // wait for element to be ready, get content type
  const isText = await handle.evaluate(async el => {
    if (el.observers) {
      // wait for dynamic properties
      const observers = Array.from(el.observers.values());
      await Promise.all(observers.map(obs => obs.promise()));
    } else if (el.observer) {
      // wait for reactive runtime cell
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
    return convertImage(handle, node, options);
  }
}
