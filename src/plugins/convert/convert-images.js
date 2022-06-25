import { getAstId } from './get-ast-id.js';
import toImage from './to-image.js';

export default async function(astMap, page, selector, options) {
  for (let handle of await page.$$(selector)) {
    const astId = await getAstId(handle);
    await toImage(astId, astMap.get(astId), handle, { ...options, outer: true });
  }
}
