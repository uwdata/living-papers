import { spawn } from 'child_process';
import process from 'node:process';

export async function pdflatex(cwd, name, {
  bibtex = true,
  stdout = false
}) {
  const args = [
    '-draftmode',
    '-shell-escape',
    '-interaction=nonstopmode',
    name
  ];

  function exec(cmd, args) {
    return new Promise(function(resolve, reject) {
      const child = spawn(cmd, args, { cwd });
      child.stdout.on('data', data => {
        if (stdout) {
          process.stdout.write(data);
        }
      });
      child.on('exit', code => resolve(code));
      child.on('error', err => reject(err));
    });
  }

  if (bibtex) {
    await exec('pdflatex', args);
    await exec('bibtex', [name]);
    await exec('pdflatex', args);
  }

  await exec('pdflatex', args.slice(1));
}
