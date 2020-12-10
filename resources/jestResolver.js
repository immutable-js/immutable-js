const path = require('path');
const pkg = require('../package.json');

module.exports = (request, options) => {
  if (request === 'immutable') {
    if (process.env.CI) {
      // In CI environment, let's test the real builded file to be sure that the build does is not broken
      return path.resolve(options.rootDir, pkg.main);
    }

    // in development mode, we want sourcemaps and live reload, etc, so let's point to the src/ directory
    return path.resolve('src', 'Immutable.js');
  }

  // Call the defaultResolver, if we want to load non-immutable
  return options.defaultResolver(request, options);
};
