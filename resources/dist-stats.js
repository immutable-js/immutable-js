const { exec } = require('child_process');
const { deflate } = require('zlib');
const fs = require('fs');

require('colors');

const fileContent = filePath =>
  new Promise((resolve, reject) =>
    fs.readFile(filePath, (error, out) =>
      error ? reject(error) : resolve(out)
    )
  );

const gitContent = gitPath =>
  new Promise(resolve =>
    exec(`git show ${gitPath}`, (error, out) => {
      if (error) {
        console.log(
          `"git show ${gitPath}" failed, resulting in an empty diff.`.yellow
        );
        resolve('');
        return;
      }
      resolve(out);
    })
  );

const deflateContent = content =>
  new Promise((resolve, reject) =>
    deflate(content, (error, out) => (error ? reject(error) : resolve(out)))
  );

const space = (n, s) =>
  new Array(Math.max(0, 10 + n - (s || '').length)).join(' ') + (s || '');

const bytes = b =>
  `${b.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} bytes`;

const diff = (n, o) => {
  const d = n - o;
  return d === 0 ? '' : d < 0 ? ` ${bytes(d)}`.green : ` +${bytes(d)}`.red;
};

const pct = (s, b) => ` ${Math.floor(10000 * (1 - s / b)) / 100}%`.grey;

Promise.all([
  fileContent('dist/immutable.js'),
  gitContent('main:dist/immutable.js'),
  fileContent('dist/immutable.min.js'),
  gitContent('main:dist/immutable.min.js'),
  fileContent('dist/immutable.min.js').then(deflateContent),
  gitContent('main:dist/immutable.min.js').then(deflateContent),
])
  .then(results => results.map(result => Buffer.byteLength(result, 'utf8')))
  .then(results => results.map(result => parseInt(result, 10)))
  .then(([rawNew, rawOld, minNew, minOld, zipNew, zipOld]) => {
    console.log(
      `  Raw: ${space(14, bytes(rawNew).cyan)}       ${space(
        15,
        diff(rawNew, rawOld)
      )}`
    );
    console.log(
      `  Min: ${space(14, bytes(minNew).cyan)}${pct(minNew, rawNew)}${space(
        15,
        diff(minNew, minOld)
      )}`
    );
    console.log(
      `  Zip: ${space(14, bytes(zipNew).cyan)}${pct(zipNew, rawNew)}${space(
        15,
        diff(zipNew, zipOld)
      )}`
    );
  });
