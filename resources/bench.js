/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Benchmark = require('benchmark');
var child_process = require('child_process');
var colors = require('colors');
var fs = require('fs');
var path = require('path');
var vm = require('vm');

function promisify(fn) {
  return function () {
    return new Promise((resolve, reject) =>
      fn.apply(
        this,
        Array.prototype.slice
          .call(arguments)
          .concat((err, out) => (err ? reject(err) : resolve(out)))
      )
    );
  };
}

var exec = promisify(child_process.exec);
var readdir = promisify(fs.readdir);
var readFile = promisify(fs.readFile);

var perfDir = path.resolve(__dirname, '../perf/');

Promise.all([
  readFile(path.resolve(__dirname, '../dist/immutable.js'), {
    encoding: 'utf8',
  }),
  exec('git show origin/npm:dist/immutable.js'),
])
  .then(function (args) {
    var newSrc = args[0];
    var oldSrc = args[1].toString({ encoding: 'utf8' }).slice(0, -1); // wtf, comma?
    return newSrc === oldSrc ? [newSrc] : [newSrc, oldSrc];
  })
  .then(function (sources) {
    return sources.map(function (source) {
      var sourceExports = {};
      var sourceModule = { exports: sourceExports };
      vm.runInNewContext(
        source,
        {
          require: require,
          module: sourceModule,
          exports: sourceExports,
        },
        'immutable.js'
      );
      return sourceModule.exports;
    });
  })
  .then(function (modules) {
    return readdir(perfDir)
      .then(function (filepaths) {
        return Promise.all(
          filepaths.map(function (filepath) {
            return readFile(path.resolve(perfDir, filepath)).then(function (
              source
            ) {
              return {
                path: filepath,
                source: source,
              };
            });
          })
        );
      })
      .then(function (sources) {
        var tests = {};

        modules.forEach(function (Immutable, version) {
          sources.forEach(function (source) {
            var description = [];
            var beforeStack = [];
            var beforeFn;
            var prevBeforeFn;

            function describe(name, fn) {
              description.push(name);
              beforeStack.push(prevBeforeFn);
              prevBeforeFn = beforeFn;
              fn();
              beforeFn = prevBeforeFn;
              prevBeforeFn = beforeStack.pop();
              description.pop();
            }

            function beforeEach(fn) {
              beforeFn = !prevBeforeFn
                ? fn
                : (function (prevBeforeFn) {
                    return function () {
                      prevBeforeFn();
                      fn();
                    };
                  })(prevBeforeFn);
            }

            function it(name, test) {
              var fullName = description.join(' > ') + ' ' + name;
              (
                tests[fullName] ||
                (tests[fullName] = {
                  description: fullName,
                  tests: [],
                })
              ).tests[version] = {
                before: beforeFn,
                test: test,
              };
            }

            vm.runInNewContext(
              source.source,
              {
                describe: describe,
                it: it,
                beforeEach: beforeEach,
                console: console,
                Immutable: Immutable,
              },
              source.path
            );
          });
        });

        // Array<{
        //   description: String,
        //   tests: Array<{
        //     before: Function,
        //     test: Function
        //   }> // one per module, [new,old] or just [new]
        // }>
        return Object.keys(tests).map(function (key) {
          return tests[key];
        });
      });
  })
  .then(function (tests) {
    var suites = [];

    tests.forEach(function (test) {
      var suite = new Benchmark.Suite(test.description, {
        onStart: function (event) {
          console.log(event.currentTarget.name.bold);
          process.stdout.write('  ...running...  '.gray);
        },
        onComplete: function (event) {
          process.stdout.write('\r\x1B[K');
          var stats = Array.prototype.map.call(event.currentTarget, function (
            target
          ) {
            return target.stats;
          });

          function pad(n, s) {
            return Array(Math.max(0, 1 + n - s.length)).join(' ') + s;
          }

          function fmt(b) {
            return Math.floor(b)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }

          function pct(p) {
            return Math.floor(p * 10000) / 100 + '%';
          }

          var dualRuns = stats.length === 2;

          if (dualRuns) {
            var prevMean = 1 / stats[1].mean;
            var prevLow = 1 / (stats[1].mean + stats[1].deviation * 2);
            var prevHigh = 1 / (stats[1].mean - stats[1].deviation * 2);

            // console.log(
            //   (dualRuns ? '  Old: '.bold.gray : '  ') +
            //   (
            //     pad(9, fmt(prevLow)) + ' ' +
            //     pad(9, fmt(prevMean)) + ' ' +
            //     pad(9, fmt(prevHigh)) + ' ops/sec'
            //   )
            // );

            var prevLowmoe = 1 / (stats[1].mean + stats[1].moe);
            var prevHighmoe = 1 / (stats[1].mean - stats[1].moe);

            console.log(
              (dualRuns ? '  Old: '.bold.gray : '  ') +
                (pad(9, fmt(prevLowmoe)) +
                  ' ' +
                  pad(9, fmt(prevMean)) +
                  ' ' +
                  pad(9, fmt(prevHighmoe)) +
                  ' ops/sec')
            );
          }

          var mean = 1 / stats[0].mean;
          var low = 1 / (stats[0].mean + stats[0].deviation * 2);
          var high = 1 / (stats[0].mean - stats[0].deviation * 2);

          // console.log(
          //   (dualRuns ? '  New: '.bold.gray : '  ') +
          //   (
          //     pad(9, fmt(low)) + ' ' +
          //     pad(9, fmt(mean)) + ' ' +
          //     pad(9, fmt(high)) + ' ops/sec'
          //   )
          // );

          var lowmoe = 1 / (stats[0].mean + stats[0].moe);
          var highmoe = 1 / (stats[0].mean - stats[0].moe);

          console.log(
            (dualRuns ? '  New: '.bold.gray : '  ') +
              (pad(9, fmt(lowmoe)) +
                ' ' +
                pad(9, fmt(mean)) +
                ' ' +
                pad(9, fmt(highmoe)) +
                ' ops/sec')
          );

          if (dualRuns) {
            var diffMean = (mean - prevMean) / prevMean;

            var comparison = event.currentTarget[1].compare(
              event.currentTarget[0]
            );
            var comparison2 = event.currentTarget[0].compare(
              event.currentTarget[1]
            );
            console.log('  compare: ' + comparison + ' ' + comparison2);

            console.log('  diff: ' + pct(diffMean));

            function sq(p) {
              return p * p;
            }

            var rme = Math.sqrt(
              (sq(stats[0].rme / 100) + sq(stats[1].rme / 100)) / 2
            );
            // console.log('rmeN: ' + stats[0].rme);
            // console.log('rmeO: ' + stats[1].rme);
            console.log('  rme: ' + pct(rme));
          }

          // console.log(stats);
        },
      });

      test.tests.forEach(function (run) {
        suite.add({
          fn: run.test,
          onStart: run.before,
          onCycle: run.before,
        });
      });

      suites.push(suite);
    });

    var onBenchComplete;
    var promise = new Promise(function (_resolve) {
      onBenchComplete = _resolve;
    });

    Benchmark.invoke(suites, 'run', { onComplete: onBenchComplete });

    return onBenchComplete;
  })
  .then(function () {
    console.log('all done');
  })
  .catch(function (error) {
    console.log('ugh', error.stack);
  });
