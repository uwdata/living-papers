import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_PORT = 3002;
const MAX_ATTEMPTS = 100;

let server;

export async function startServer(basePath, port = DEFAULT_PORT) {
  if (server) {
    await stopServer();
  }

  const baseURL = `file://${path.resolve(basePath)}/`;

  // Server largely based on https://stackoverflow.com/a/29046869
  server = http.createServer(async (req, res) => {

    // route URL to file path
    let pathname = fileURLToPath(new URL(`.${req.url}`, baseURL));

    // based on the path, extract the file extension. e.g. .js, .doc, ...
    const ext = path.parse(pathname).ext;

    // maps file extension to MIME type
    const map = {
      '.ico': 'image/x-icon',
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.wav': 'audio/wav',
      '.mp3': 'audio/mpeg',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword'
    };

    let stats;
    try {
      stats = await fs.stat(pathname);
    } catch (err) { // eslint-disable-line no-unused-vars
      // if the file is not found, return 404
      res.statusCode = 404;
      res.end(`File ${pathname} not found!`);
      return;
    }

    // if is a directory search for index file matching the extension
    if (stats.isDirectory()) {
      pathname += '/index' + ext;
    }

    // read file from file system
    try {
      const data = await fs.readFile(pathname);
      // if the file is found, set Content-type and send data
      res.setHeader('Content-type', map[ext] || 'text/plain' );
      res.end(data);
    } catch (err) {
      res.statusCode = 500;
      res.end(`Error getting the file: ${err}.`);
    }
  });

  return new Promise((resolve, reject) => {
    let attempts = 0;

    server.on('listening', err => {
      if (!err) resolve(port);
    });

    server.on('error', err => {
      if (err.code === 'EADDRINUSE' && ++attempts < MAX_ATTEMPTS) {
        server.close();
        server.listen(++port, 'localhost');
      } else {
        reject(err);
      }
    });

    server.listen(port, 'localhost');
  });
}

export function stopServer() {
  return new Promise(resolve => {
    server
      ? server.close(() => { resolve(); })
      : resolve();
  });
}
