import { spawn } from 'child_process';

export async function pdflatex(
  path,
  name,
  bibtex = true,
  logger = console
) {
  const texArgs = ['-interaction=nonstopmode', name];
  const bibArgs = [name];
  const cwd = path;

  logger.debug(`Running pdflatex for ${name}.tex`);
  await exec('pdflatex', texArgs, cwd);
  if (bibtex) {
    await exec('bibtex',   bibArgs, cwd);
    await exec('pdflatex', texArgs, cwd);
    await exec('pdflatex', texArgs, cwd);
  }
}

function exec(cmd, args, cwd) {
  return new Promise(function(resolve, reject) {
    const process = spawn(cmd, args, { cwd });
    process.on('exit', code => resolve(code));
    process.on('error', err => reject(err));
  });
}
