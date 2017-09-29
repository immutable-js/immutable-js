#!/bin/sh -e

# This script maintains a git branch which mirrors master but in a form that
# what will eventually be deployed to npm, allowing npm dependencies to use:
#
#     "immutable": "git://github.com/facebook/immutable-js.git#npm"
#

# Create empty npm directory
rm -rf npm
mkdir npm

# Copy over necessary files
cp -r dist npm/
cp -r contrib npm/
cp README.md npm/
cp LICENSE npm/
cp PATENTS npm/

# Ensure a vanilla package.json before deploying so other tools do not interpret
# The built output as requiring any further transformation.
node -e "var package = require('./package.json'); \
  delete package.scripts; \
  delete package.options; \
  delete package.jest; \
  delete package.devDependencies; \
  require('fs').writeFileSync('./npm/package.json', JSON.stringify(package, null, 2));"

cd npm
git init
git config user.name "Travis CI"
git config user.email "github@fb.com"
git add .
git commit -m "Deploy master to NPM branch"
git push --force --quiet "https://${GH_TOKEN}@github.com/facebook/immutable-js.git" master:npm
