// test logger that collects all messages
export function logger() {
  const msg = { log: [], debug: [], info: [], warn: [], error: [] };
  return Object.keys(msg)
    .reduce((obj, key) => {
      obj[key] = _ => msg[key].push(_);
      return obj;
    }, { msg });
}
