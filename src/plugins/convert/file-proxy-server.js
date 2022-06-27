import http from 'node:http';
import url from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const DEFAULT_PORT = 3002;
const MAX_ATTEMPTS = 100;

let server;

export async function startServer(basePath, port = DEFAULT_PORT) {
  if (server) {
    await stopServer();
  }

  // Server largely based on https://stackoverflow.com/a/29046869
  server = http.createServer(function(req, res) {

    // parse URL
    const parsedUrl = url.parse(req.url);

    // extract URL path
    let pathname = `${basePath}${parsedUrl.pathname}`;

    // based on the URL path, extract the file extension. e.g. .js, .doc, ...
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

    fs.exists(pathname, function (exist) {
      if(!exist) {
        // if the file is not found, return 404
        res.statusCode = 404;
        res.end(`File ${pathname} not found!`);
        return;
      }

      // if is a directory search for index file matching the extension
      if (fs.statSync(pathname).isDirectory()) pathname += '/index' + ext;

      // read file from file system
      fs.readFile(pathname, function(err, data){
        if (err) {
          res.statusCode = 500;
          res.end(`Error getting the file: ${err}.`);
        } else {
          // if the file is found, set Content-type and send data
          res.setHeader('Content-type', map[ext] || 'text/plain' );
          res.end(data);
        }
      });
    });
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
