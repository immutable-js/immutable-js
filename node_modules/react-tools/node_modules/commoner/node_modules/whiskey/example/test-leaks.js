#!/usr/bin/env node

var assert = require('../lib/assert').getAssertModule();
var exec = require('child_process').exec;

var sprintf = require('sprintf').sprintf;
var async = require('async');

var cwd = process.cwd();
var cmd1 = sprintf('%s/bin/whiskey --tests %s/example/test-scope-leaks.js ' +
                   '--sequential --scope-leaks --timeout 2000', cwd, cwd);

var cmd2 = sprintf('%s/bin/whiskey --tests %s/example/test-scope-leaks.js ' +
                  '--concurrency 100 --scope-leaks --timeout 2000', cwd, cwd);

async.series([
  function testSequentialMode(callback) {
    exec(cmd1, function(err, stdout, stderr) {
      try {
        assert.match(stdout, /leaked variables/i);
        assert.match(stdout, /test_scope_leaks_on_success: a, b, c[^,]/i);
        assert.match(stdout, /test_scope_leaks_on_failure: d[^,]/i);
      }
      catch (err2) {
        callback(err2);
        return;
      }

      callback();
    });
  },

  function testParallelMode(callback) {
    exec(cmd2, function(err, stdout, stderr) {
      try {
        assert.match(stdout, /leaked variables/i);
        assert.match(stdout, /test-scope-leaks\.js:/i);
      }
      catch (err2) {
        callback(err2);
        return;
      }

      callback();
    });
  }],

  function(err) {
    if (err) {
      process.exit(3);
    }
    else {
      process.exit(0);
    }
  });
