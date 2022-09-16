import { spawn } from 'child_process';
import process from 'node:process';

export async function pdflatex(path, name, bibtex = true) {
  const args = [
    '-draftmode',
    '-shell-escape',
    '-interaction=nonstopmode',
    name
  ];

  if (bibtex) {
    await exec('pdflatex', args, path);
    await exec('bibtex', [name], path);
    await exec('pdflatex', args, path);
  }

  await exec('pdflatex', args.slice(1), path);
}

function exec(cmd, args, cwd) {
  return new Promise(function(resolve, reject) {
    const child = spawn(cmd, args, { cwd });
    child.stdout.on('data', data => process.stdout.write(data));
    child.on('exit', code => resolve(code));
    child.on('error', err => reject(err));
  });
}
