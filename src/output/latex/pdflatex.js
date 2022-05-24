import { spawn } from 'child_process';

export async function pdflatex(path, name, bibtex = true) {
  const args = ['-interaction=nonstopmode', name];
  await exec('pdflatex', args, path);
  if (bibtex) {
    await exec('bibtex', [name], path);
    await exec('pdflatex', args, path);
    await exec('pdflatex', args, path);
  }
}

function exec(cmd, args, cwd) {
  return new Promise(function(resolve, reject) {
    const process = spawn(cmd, args, { cwd });
    process.on('exit', code => resolve(code));
    process.on('error', err => reject(err));
  });
}
