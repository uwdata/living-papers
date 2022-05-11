import { spawn } from 'child_process';

export function rscript(scriptFile, args, options) {
  return new Promise((resolve, reject) => {
    try {
      const Rscript = spawn('Rscript', [scriptFile, ...args], options);

      let errmsg = '';
      Rscript.stderr.on('data', data => {
        errmsg += data.toString();
      });

      Rscript.on('error', (err) => {
        reject(err);
      });

      Rscript.on('exit', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error(`Rscript exited with code ${code}:\n${errmsg}`));
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
