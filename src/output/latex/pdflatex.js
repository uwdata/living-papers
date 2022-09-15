import { spawn } from 'child_process';

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
    const process = spawn(cmd, args, { cwd });
    process.on('exit', code => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command ${cmd} exited with code ${code}`));
      }
    });
    process.on('exit', code => resolve(code));
    process.on('error', err => reject(err));
  });
}
