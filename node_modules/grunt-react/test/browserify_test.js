'use strict';

var Transformers  = require('../lib/transformers');
var fs            = require('fs');

exports.transformers = {
  setUp: function(done) {
    done();
  },
  source_js: function(test) {
    test.expect(1);

    var actual    = fs.readFileSync('tmp/browserify/module.js').toString() + '\n';
    var expected  = fs.readFileSync('test/expected/browserify').toString();

    test.equal(actual, expected, 'JSX should be compiled by browserify');
    test.done();
  }
};
