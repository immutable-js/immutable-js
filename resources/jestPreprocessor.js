// preprocessor.js
var path = require('path');
var ts = require('ts-compiler');
var react = require('react-tools');

module.exports = {
  process: function(src, filePath) {
    if (filePath.match(/\.ts$/) && !filePath.match(/\.d\.ts$/)) {
      ts.compile([filePath], {
        skipWrite: true,
        module: 'commonjs'
      }, function(err, results) {
        if (err) {
          throw err;
        }
        results.forEach(function(file) {
          // This is gross, but jest doesn't provide an asynchronous way to
          // process a module, and ts currently runs syncronously.
          src = file.text;
        });
      });
      return src;
    }
    if (filePath.match(/\.js$/)) {
      return react.transform(src, {harmony: true}).replace(
        /require\('immutable/g,
        "require('" + path.relative(path.dirname(filePath), process.cwd())
      );
    }
    return src;
  }
};
