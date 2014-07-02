'use strict';

var Transformers  = require('../lib/transformers');
var fs            = require('fs');

exports.transformers = {
  setUp: function(done) {
    done();
  },
  source_js: function(test) {
    test.expect(1);

    var source    = fs.readFileSync('tmp/js/fixture.js').toString();
    var actual    = Transformers.source(source);
    var expected  = fs.readFileSync('tmp/js/fixture.js').toString();

    test.equal(actual, expected, 'should leave vanilla JS alone');
    test.done();
  },
  source_jsx: function(test) {
    test.expect(1);

    var source    = fs.readFileSync('tmp/js/fixture-jsx.js').toString();
    var actual    = Transformers.source(source);
    var expected  = fs.readFileSync('test/expected/default_options').toString();

    test.equal(actual, expected, 'should convert JSX into JS');
    test.done();
  }
};
