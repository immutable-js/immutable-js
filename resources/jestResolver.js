const path = require('path');
const pkg = require('../package.json');

module.exports = (request, options) => {
  if (request === 'immutable') {
    if (process.env.CI) {
      // In CI environment, test the real built file to be sure that the build is not broken
      return path.resolve(options.rootDir, pkg.main);
    }

    // In development mode, we want sourcemaps, live reload, etc., so point to the src/ directory
    return `${options.rootDir}/src/Immutable.js`;
  }

  // Call the defaultResolver, if we want to load non-immutable
  return options.defaultResolver(request, options);
};
