#!/bin/sh -e

# This script prepares an npm directory with files safe to publish to npm or the
# npm git branch:
#
#     "immutable": "git://github.com/immutable-js/immutable-js.git#npm"
#

# Create empty npm directory
rm -rf npm
mkdir -p npm

# Copy over necessary files
cp -r dist npm/
cp README.md npm/
cp LICENSE npm/

# Ensure a vanilla package.json before deploying so other tools do not interpret
# The built output as requiring any further transformation.
node -e "var package = require('./package.json'); \
  delete package.scripts; \
  delete package.options; \
  delete package.jest; \
  delete package.prettier; \
  delete package.devDependencies; \
  require('fs').writeFileSync('./npm/package.json', JSON.stringify(package, null, 2));"

# Retain marginal support for bower on the npm branch
cp npm/package.json npm/bower.json
