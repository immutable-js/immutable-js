#!/usr/bin/env node

var assert = require('../lib/assert').getAssertModule();
var exec = require('child_process').exec;

var sprintf = require('sprintf').sprintf;

var cwd = process.cwd();

exec(sprintf('%s/bin/whiskey --tests %s/example/test-print-stdout-stderr-timeout.js --timeout 1000', cwd, cwd),
  function(err, stdout, stderr) {
    try {
      assert.match(stdout, /this is stdout 1/);
      assert.match(stdout, /this is stdout 2/);
      assert.match(stdout, /this is stderr 1/);
      assert.match(stdout, /this is stderr 2/);
    }
    catch (err2) {
      process.exit(5);
    }

    process.exit(0);
});
