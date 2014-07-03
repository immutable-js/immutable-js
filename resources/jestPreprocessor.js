// preprocessor.js
var ts = require('ts-compiler');

module.exports = {
  process: function(src, path) {
    if (path.match(/\.ts$/) && !path.match(/\.d\.ts$/)) {
      ts.compile([path], {
        skipWrite: true,
        module: 'commonjs'
      }, function(err, results) {
        if (err) {
          throw err;
        }
        results.forEach(function(file) {
          // This is gross, but jest doesn't provide an asyncronous way to
          // process a module, and ts currently runs syncronously.
          src = file.text;
        });
      });
      return src;
    }
    return src;
  }
};
