// preprocessor.js
var coffee = require('coffee-script');
var ts = require('ts-compiler');

module.exports = {
  process: function(src, path) {
    if (path.match(/\.coffee$/)) {
      return coffee.compile(src, {'bare': true});
    }
    if (path.match(/\.ts$/) && !path.match(/\.d\.ts$/)) {
      ts.compile([path], {
        skipWrite: true,
        module: 'commonjs'
      }, function(err, results) {
        if (err) {
          throw err;
        }
        results.forEach(function(file) {
          src = file.text;
        });
      });
      return src;
    }
    return src;
  }
};
