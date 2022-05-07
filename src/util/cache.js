import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { mkdirp, readFile, rmrf, writeFile } from './fs.js';

export async function cache({
  cacheDir = './.cache',
  defaultTTL = 1000 * 60 * 60 * 24 * 15 // 15 days
} = {}) {
  const md5 = key => createHash('md5').update(key).digest('hex');
  const local = new Map;

  await mkdirp(cacheDir);

  function file(key) {
    return join(cacheDir, md5(key));
  }

  function _delete(key) {
    local.delete(key);
    return rmrf(file(key));
  }

  return {
    async get(key) {
      try {
        let entry = local.has(key)
          ? local.get(key)
          : JSON.parse(await readFile(file(key)));

        if (entry?.expires < Date.now()) {
          _delete(key);
          entry = null;
        }
        return entry?.data;
      } catch (err) {
        return;
      }
    },
    set(key, data, ttl = defaultTTL) {
      const entry = { data, expires: Date.now() + ttl };
      local.set(key, entry);
      writeFile(file(key), JSON.stringify(entry));
    },
    delete: _delete
  };
}
