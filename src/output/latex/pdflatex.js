import { spawn } from 'child_process';

export async function pdflatex(path, name, bibtex = true, showOutput = false) {
  const args = ['-shell-escape', '-interaction=nonstopmode', name];
  if (bibtex) {
    const draftArgs = ['-draftmode', ...args];
    await exec('pdflatex', draftArgs, path, showOutput);
    await exec('bibtex', [name], path, showOutput);
    await exec('pdflatex', draftArgs, path, showOutput);
  }
  await exec('pdflatex', args, path, showOutput);
}

function exec(cmd, args, cwd, showOutput) {
  return new Promise(function(resolve, reject) {
    const process = spawn(cmd, args, { cwd, stdio: showOutput ? 'inherit' : 'ignore' });
    process.on('exit', code => resolve(code));
    process.on('error', err => reject(err));
  });
}
