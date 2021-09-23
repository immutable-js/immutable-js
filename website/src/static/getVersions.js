const { execSync } = require('child_process');

let versions;

/** @returns {Array<string>} */
function getVersions() {
  if (!versions) {
    const tags = execSync('git tag -l --sort=-creatordate', {
      encoding: 'utf8',
    }).split('\n');
    const latestV4Tag = tags.find(t => t.match(/^v?4/));
    const latestV3Tag = tags.find(t => t.match(/^v?3/));
    versions = [];
    if (latestV4Tag) {
      versions.push(latestV4Tag);
    }
    if (latestV3Tag) {
      versions.push(latestV3Tag);
    }
    versions.push('latest@main');
  }
  return versions;
}

exports.getVersions = getVersions;
