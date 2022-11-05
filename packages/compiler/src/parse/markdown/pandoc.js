import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';

export function pandoc(options = {}) {
  const opt = {
    source: 'markdown',
    target: 'json',
    sourceExtensions: [],
    targetExtensions: [],
    ...options
  };

  return new Promise((resolve, reject) => {
    try {
      const args = [
        '-f', `${opt.source}${opt.sourceExtensions.join('')}`,
        '-t', `${opt.target}${opt.targetExtensions.join('')}`,
        ...(opt.inputFile ? [opt.inputFile] : [])
      ];
      const cmd = 'pandoc';
      const pandoc = spawn(cmd, args);
      const chunks = [];

      // if given input stream, pipe standard input
      if (opt.stdin && !opt.inputFile) {
        opt.stdin.pipe(pandoc.stdin);
      }

      // process pandoc output
      pandoc.stdout.on('data', chunk => {
        chunks.push(chunk);
      });

      // pandoc.stderr.on('data', chunk => {
      //   chunk.toString();
      // });

      pandoc.on('exit', code => {
        if (code === 0) {
          const text = Buffer.concat(chunks).toString('utf8');
          resolve(JSON.parse(text));
        } else {
          reject(new Error(`Command ${cmd} exited with code ${code}`));
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
