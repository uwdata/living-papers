import { spawn } from 'child_process';

export async function pdflatex(path, name, bibtex = true, showOutput = false) {
  const args = ['-interaction=nonstopmode', name];
  await exec('pdflatex', args, path, showOutput);
  if (bibtex) {
    await exec('bibtex', [name], path, showOutput);
    await exec('pdflatex', args, path, showOutput);
    await exec('pdflatex', args, path, showOutput);
  }
}

function exec(cmd, args, cwd, showOutput) {
  return new Promise(function(resolve, reject) {
    const process = spawn(cmd, args, { cwd, stdio: showOutput ? 'inherit' : 'ignore' });
    process.on('exit', code => resolve(code));
    process.on('error', err => reject(err));
  });
}
