
import http from 'http';
import url from 'url';
import path from 'path';
import fs from 'fs';

let server;
export const startServer = async (basePath, port) => {
  if (server) {
    await stopServer();
  }

  // Server largely based on https://stackoverflow.com/a/29046869
  server = http.createServer(function (req, res) {

    // parse URL
    const parsedUrl = url.parse(req.url);

    // extract URL path
    let pathname = `${basePath}${parsedUrl.pathname}`;

    // based on the URL path, extract the file extension. e.g. .js, .doc, ...
    const ext = path.parse(pathname).ext;

    // maps file extension to MIME typere
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
        if(err){
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
    server.listen(parseInt(port), "localhost", (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  })
}

export const stopServer = async () => {
  return new Promise((resolve, reject) => {
    if (server) {
      server.close(() => {
        resolve();
      })
    } else {
      resolve();
    }
  });
}