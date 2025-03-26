import fs from 'node:fs';
import path from 'node:path';

const packageJsonContent = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// remove "dist/" prefix from the file names
const distPrefix = 'dist';
const removeDistPrefix = (file) => path.basename(file);

const expectedFiles = [
  removeDistPrefix(packageJsonContent.main),
  removeDistPrefix(packageJsonContent.module),
  removeDistPrefix(packageJsonContent.types),

  // extra files that are not in package.json
  'immutable.min.js',
  'immutable.js.flow',
];

console.log('expected files: ', expectedFiles);

const filesInDistDir = fs
  .readdirSync(distPrefix)
  .filter((file) => !file.startsWith('.'));

// There should be no extra files in the dist directory and all expected files should be present
const extraFiles = filesInDistDir.filter(
  (file) => !expectedFiles.includes(file)
);
if (extraFiles.length > 0) {
  console.error('Extra files found in dist directory:', extraFiles);
}

const missingFiles = expectedFiles.filter(
  (file) => !filesInDistDir.includes(file)
);
if (missingFiles.length > 0) {
  console.error('Missing files in dist directory:', missingFiles);
}

if (extraFiles.length > 0 || missingFiles.length > 0) {
  process.exit(1);
}

console.log('All expected files are present in the dist directory.');
