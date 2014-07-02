#!/usr/bin/env node

var assert = require('../lib/assert').getAssertModule();
var exec = require('child_process').exec;

var sprintf = require('sprintf').sprintf;

var cwd = process.cwd();

exec(sprintf('%s/bin/whiskey --tests %s/example/test-success-with-coverage.js --timeout 6000 --coverage --coverage-reporter cli', cwd, cwd),
  function(err, stdout, stderr) {
    try {
      assert.match(stdout, /test coverage/i);
      assert.match(stdout, /coverage\.js/);
      assert.match(stdout, /loc/i);
      assert.match(stdout, /sloc/i);
      assert.match(stdout, /missed/i);
    }
    catch (err2) {
      process.exit(5);
    }

    process.exit(0);
});
