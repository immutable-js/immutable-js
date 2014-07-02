#!/usr/bin/env node

var assert = require('../lib/assert').getAssertModule();
var exec = require('child_process').exec;

var sprintf = require('sprintf').sprintf;

var cwd = process.cwd();

exec(sprintf('%s/bin/whiskey --tests %s/example/test-timeout.js --timeout 1000', cwd, cwd),
  function(err, stdout, stderr) {
    try {
      assert.match(stdout, /test_success_1/);
      assert.match(stdout, /test_success_2/);
      assert.match(stdout, /test_success_3/);
      assert.match(stdout, /timeout/i);
    }
    catch (err2) {
      process.exit(4);
    }

    process.exit(0);
  });

