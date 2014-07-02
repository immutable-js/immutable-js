/*
 * Licensed to Cloudkick, Inc ('Cloudkick') under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Cloudkick licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var util = require('util');
var fs = require('fs');
var path = require('path');
var net = require('net');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;

var sprintf = require('sprintf').sprintf;
var async = require('async');
var logmagic = require('logmagic');
var underscore = require('underscore');

var constants = require('./constants');
var parser = require('./parser');
var common = require('./common');
var testUtil = require('./util');
var coverage = require('./coverage');
var getReporter = require('./reporters/index').getReporter;
var generateMakefile = require('./gen_makefile').generateMakefile;
var _debugger = require('./debugger');
var DebuggerInterface = _debugger.Interface;
var ProcessRunner = require('./process_runner/runner').ProcessRunner;

exports.exitCode = 0;
exports.processRunner = null;

function TestRunner(options) {
  var testReporter, coverageReporter, scopeLeaksReporter,
      testReporterOptions, coverageReporterOptions, scopeLeaksReporterOptions,
      defaultSocketPath;

  defaultSocketPath = sprintf('%s-%s', constants.DEFAULT_SOCKET_PATH,
                              Math.random() * 10000);
  this._tests = options['tests'];
  this._independent_tests = options['independent-tests'];
  this._max_suites = options['max-suites'];
  this._dependencies = options['dependencies'] || null;
  this._onlyEssential = options['only-essential'] || false;
  this._socketPath = options['socket-path'] || defaultSocketPath;
  this._coverage = options['coverage'];
  this._scopeLeaks = options['scope-leaks'];
  this._verbosity = options['verbosity'] || constants.DEFAULT_VERBOSITY;
  this._failfast = options['failfast'] || false;
  this._realTime = options['real-time'] || false;
  this._debug = options['debug'];

  testReporter = options['test-reporter'] || constants.DEFAULT_TEST_REPORTER;
  testReporterOptions = {
    'print_stdout': options['print-stdout'],
    'print_stderr': options['print-stderr'],
    'styles': (options['no-styles'] ? false : true),
    'report_timing': options['report-timing']
  };

  this._testReporter = getReporter('test', testReporter, this._tests,
                                   testReporterOptions);

  if (this._coverage) {
      coverageReporter = options['coverage-reporter'] || constants.DEFAULT_COVERAGE_REPORTER;
      coverageReporterOptions = {
        'directory': options['coverage-dir'],
        'file': options['coverage-file']
      };

      this._coverageReporter = getReporter('coverage',
                                            coverageReporter,
                                            this._tests,
                                            coverageReporterOptions);
  }
  else {
      this._coverageReporter = null;
  }

  if (this._scopeLeaks) {
    scopeLeaksReporter = options['scope-leaks-reporter'] || constants.DEFAULT_SCOPE_LEAKS_REPORTER;
    scopeLeaksReporterOptions = {
      'sequential': (options['concurrency'] === 1 || options['sequential'])
    };
    this._scopeLeaksReporter = getReporter('scope-leaks', scopeLeaksReporter,
                                           this._tests,
                                           scopeLeaksReporterOptions);
  }
  else {
    this._scopeLeaksReporter = null;
  }

  this._server = null;
  this._processRunner = null;
  this._testFilesData = {};

  this._completed = false;
  this._forceStopped = false;
  this._completedTests = [];
}

TestRunner.prototype.runTests = function(testInitFile, chdir,
                                         customAssertModule,
                                         timeout,
                                         concurrency, failFast) {
  var self = this, ops = [];
  timeout = timeout || constants.DEFAULT_TEST_TIMEOUT;

  function handleChildTimeout(child, filePath) {
    var resultObj, testFile;

    if (!child.killed) {
      testFile = self._testFilesData[filePath];

      resultObj = {
        'tests': [],
        'timeout': true
      };

      child.kill('SIGKILL');
      self._handleTestResult(filePath, resultObj);
    }

    if (self._failfast) {
      self.forceStop();
    }
  }

  function runSuite(filePath, callback) {
    var result, pattern, cwd, child, timeoutId, testFileData;

    if (self._completed || self._forceStopped) {
      callback(new Error('Runner has been stopped'));
      return;
    }

    cwd = process.cwd();
    result = common.getTestFilePathAndPattern(filePath);
    filePath = result[0];
    pattern = result[1];
    filePath = (filePath.charAt(0) !== '/') ? path.join(cwd, filePath) : filePath;
    child = self._spawnTestProcess(filePath, testInitFile, chdir,
                                   customAssertModule, timeout,
                                   concurrency, pattern);

    if (!self._debug) {
      timeoutId = setTimeout(function() {
        handleChildTimeout(child, filePath, callback);
      }, timeout);
    }

    self._testFilesData[filePath] = {
      'child': child,
      'callback': callback,
      'timeout_id': timeoutId,
      'stdout': '',
      'stderr': ''
    };

    testFileData = self._testFilesData[filePath];

    child.stdout.on('data', function(chunk) {
      if (self._realTime) {
        process.stdout.write(chunk.toString());
      }
      else {
        testFileData['stdout'] += chunk;
      }
    });

    child.stderr.on('data', function(chunk) {
      if (self._realTime) {
        process.stderr.write(chunk.toString());
      }
      else {
        testFileData['stderr'] += chunk;
      }
    });

    child.on('exit', function() {
      clearTimeout(timeoutId);
      self._handleTestFileEnd(filePath);
      delete self._testFilesData[filePath];
    });
  }

  function onBound() {
    self._testReporter.handleTestsStart();
    async.series([
        async.forEachLimit.bind(null, self._independent_tests, self._max_suites, runSuite),
        async.forEachSeries.bind(null, self._tests, runSuite)
    ], self._handleTestsCompleted.bind(self));
  }

  function startServer(callback) {
    self._startServer(self._handleConnection.bind(self),
                      onBound);
  }

  function createRunner(callback) {
    self._processRunner = new ProcessRunner(self._dependencies);
    exports.processRunner = self._processRunner;
    callback(null, null);
  }

  function findDependenciesToRun(_, callback) {
    var cwd = process.cwd();
    var testPaths = self._tests.map(function(testPath) {
      testPath = common.getTestFilePathAndPattern(testPath)[0];
      testPath = (testPath.charAt(0) !== '/') ? path.join(cwd, testPath) : testPath;
      return testPath;
    });

    self._processRunner.findDependencies(testPaths, callback);
  }

  function startDependencies(dependencies, callback) {
    self._processRunner.start(dependencies, callback);
  }

  if (self._dependencies) {
    ops.push(createRunner);

    if (self._onlyEssential) {
      ops.push(findDependenciesToRun);
    }

    ops.push(startDependencies);
  }

  ops.push(startServer);

  async.waterfall(ops, function(err) {
    if (err) {
      throw err;
    }
 });
};

TestRunner.prototype._spawnTestProcess = function(filePath,
                                                  testInitFile,
                                                  chdir,
                                                  customAssertModule,
                                                  timeout,
                                                  concurrency,
                                                  pattern) {
  var cwd = process.cwd();
  var libCovDir = (this._coverage) ? path.join(cwd, 'lib-cov') : null;
  var runFilePath = path.join(__dirname, 'run_test_file.js');
  var port = parseInt((Math.random() * (65000 - 2000) + 2000), 10);
  var args = [];

  if (this._debug) {
    args.push('--debug-brk=' + port);
  }

  args = args.concat([runFilePath, filePath, this._socketPath, cwd, libCovDir,
                      this._scopeLeaks, chdir, customAssertModule, testInitFile,
                      timeout, concurrency, pattern]);
  this._testReporter.handleTestFileStart(filePath);
  var child = spawn(process.execPath, args);

  if (this._debug) {
    var debuggerInterface = new DebuggerInterface();
    debuggerInterface.connect(port, 400, function(err, client) {
      // Skip the breakpoint set by debug-brk
      client.reqContinue();
    });
  }

  return child;
};

TestRunner.prototype._addCompletedTest = function(filePath) {
  this._completedTests.push(filePath);
};

TestRunner.prototype._handleTestsCompleted = function() {
  var statusCode;

  if (!this._completed || this._forceStopped) {
    this._completed = true;
    this._stopServer();

    statusCode = this._testReporter.handleTestsComplete();

    if (this._scopeLeaks) {
      this._scopeLeaksReporter.handleTestsComplete();
    }

    if (this._coverage) {
      this._coverageReporter.handleTestsComplete();
    }

    exports.exitCode = statusCode;

    if (this._processRunner) {
      this._processRunner.stop();
    }

    if (this._debug) {
      process.exit();
    }
  }
};

TestRunner.prototype._handleTestResult = function(filePath, resultObj) {
  this._testReporter.handleTestEnd(filePath, resultObj);

  if (this._scopeLeaks) {
    this._scopeLeaksReporter.handleTestEnd(filePath, resultObj);
  }

  if (this._failfast && resultObj['status'] === 'failure') {
    this.forceStop();
  }
};

TestRunner.prototype._handleTestCoverageResult = function(filePath, coverageData) {
  var coverageObj = JSON.parse(coverageData);
  this._coverageReporter.handleTestFileComplete(filePath, coverageObj);
};

TestRunner.prototype._handleTestFileEnd = function(filePath) {
  var testData, coverageData, resultObj, coverageObj, split, testFile;
  var stdout = '';
  var stderr = '';

  testFile = this._testFilesData[filePath];
  if (testFile) {
    stdout = testFile['stdout'];
    stderr = testFile['stderr'];
  }

  this._testReporter.handleTestFileComplete(filePath, stdout, stderr);
  this._addCompletedTest(filePath);

  if (testFile) {
    testFile['callback']();
  }
};

TestRunner.prototype._handleConnection = function(connection) {
  var self = this;
  var data = '';
  var lineProcessor = new testUtil.LineProcessor();
  var dataString, endMarkIndex, testFile, testFileCallback, testFileTimeoutId;

  function onLine(line) {
    var result, filePath, end, resultObj;
    result = testUtil.parseResultLine(line);
    end = result[0];
    filePath = result[1];
    resultObj = result[2];

    if (end) {
      return;
    }

    if (resultObj.hasOwnProperty('coverage')) {
      self._handleTestCoverageResult(filePath, resultObj['coverage']);
    }
    else {
      self._handleTestResult(filePath, resultObj);
    }
  }

  lineProcessor.on('line', onLine);

  function onData(chunk) {
    lineProcessor.appendData(chunk);
    data += chunk;
  }

  connection.on('data', onData);
};

TestRunner.prototype._startServer = function(connectionHandler,
                                             onBound) {
  this._server = net.createServer(connectionHandler);
  this._server.listen(this._socketPath, onBound);
};

TestRunner.prototype.forceStop = function() {
  var testFile, testFileData, child, timeoutId;

  this._forceStopped = true;
  for (testFile in this._testFilesData) {
    if (this._testFilesData.hasOwnProperty(testFile)) {
      testFileData = this._testFilesData[testFile];
      child = testFileData['child'];
      timeoutId = testFileData['timeout_id'];
      clearTimeout(timeoutId);
      child.kill('SIGKILL');
    }
  }
};

TestRunner.prototype._stopServer = function() {
  if (this._server) {
    this._server.close();
    this._server = null;
  }
};

function run(cwd, argv) {
  var customAssertModule, exportedFunctions;
  var runner, testReporter, coverageArgs;
  var socketPath, concurrency, scopeLeaks, runnerArgs;
  var intersection;

  if ((argv === undefined) && (cwd instanceof Array)) {
    argv = cwd;
  }

  var p = parser.getParser(constants.WHISKEY_OPTIONS);
  p.banner = 'Usage: whiskey [options] --tests "files"';
  var options = parser.parseArgv(p, argv);

  if (options['coverage-files']) {
      var coverageReporter = options['coverage-reporter'] || constants.DEFAULT_COVERAGE_REPORTER;
      var coverageReporterOptions = {
        'directory': options['coverage-dir'],
        'file': options['coverage-file']
      };

      this._coverageReporter = getReporter('coverage',
                                            coverageReporter,
                                            [],
                                          coverageReporterOptions);
    var coverageObj = coverage.aggregateCoverage(options['coverage-files'].split(','));
    this._coverageReporter.handleTestsComplete(coverageObj);
  }
  else if ((options.tests && options.tests.length > 0) ||
           (options['independent-tests'] && options['independent-tests'].length > 0)) {
    options.tests = options.tests ? options.tests.split(' ') : [];
    options['independent-tests'] = options['independent-tests'] ? options['independent-tests'].split(' ') : [];

    var ms = parseInt(options['max-suites'], 10);
    if (ms) {
      options['max-suites'] = ms;
    } else {
      options['max-suites'] = 5;
    }

    intersection = underscore.intersection(options.tests, options['independent-tests']);
    if(intersection.length > 0) {
      util.puts(sprintf('The following tests cannot appear in both --tests and --independen-tests: %s', intersection));
      process.exit(1);
    }

    if (options['debug'] && options.tests.length > 1) {
      throw new Error('--debug option can currently only be used with a single test file');
    }
    else if (options['debug'] && options['independent-tests'].length > 1) {
      throw new Error('--debug cannot be used with --independent-tests.');
    }
    else if (options['gen-makefile'] && options['makefile-path']) {
      generateMakefile(options.tests, options['makefile-path'], function(err) {
        if (err) {
          throw err;
        }

        util.puts(sprintf('Makefile has been saved in %s.', options['makefile-path']));
      });

      return;
    }

    customAssertModule = options['custom-assert-module'];
    if (customAssertModule) {
      customAssertModule = (customAssertModule.charAt(0) !== '/') ? path.join(cwd, customAssertModule) : customAssertModule;

      if (path.existsSync(customAssertModule)) {
        customAssertModule = customAssertModule.replace(/$\.js/, '');
      }
      else {
        customAssertModule = null;
      }
    }

    concurrency = options['sequential'] ? 1 : options['concurrency'];
    concurrency = concurrency || constants.DEFAULT_CONCURRENCY;
    scopeLeaks = options['scope-leaks'];

    options['print-stdout'] = (options['quiet']) ? false : true;
    options['print-stderr'] = (options['quiet']) ? false : true;

    if (options['quiet']) {
      logmagic.registerSink('null', function nullLogger() {});
      logmagic.route('__root__', logmagic.INFO, 'null');
    }

    runner = new TestRunner(options);
    runnerArgs = [options['test-init-file'], options['chdir'],
                  customAssertModule, options['timeout'],
                  concurrency, options['fail-fast']];


    if (options['coverage']) {
      var nodePath = process.env['NODE_PATH'];

      if (!nodePath || nodePath.indexOf('lib-cov') === -1) {
        throw new Error('lib-cov is not in NODE_PATH. NODE_PATH environment variable' +
                         ' must contain lib-cov path for the coverage to work.');
      }

      coverageArgs = ['jscoverage'];

      if (options['coverage-encoding']) {
        coverageArgs.push(sprintf('--encoding=%s', options['coverage-encoding']));
      }

      if (options['coverage-exclude']) {
        coverageArgs.push(sprintf('--exclude=%s', options['coverage-exclude']));
      }

      if (options['coverage-no-instrument']) {
        coverageArgs.push(sprintf('--no-instrument=%s', options['coverage-no-instrument']));
      }

      coverageArgs.push(sprintf('lib %s', constants.COVERAGE_PATH));
      coverageArgs = coverageArgs.join(' ');

      if (!path.existsSync(path.join(process.cwd(), constants.COVERAGE_PATH)) || !options['coverage-no-regen']) {
        exec(sprintf('rm -fr %s ; %s', constants.COVERAGE_PATH, coverageArgs), function(err) {
          if (err) {
            if (err.message.match(/jscoverage: not found/i)) {
              err = new Error('jscoverage binary not found. To use test coverage ' +
                              ' you need to install node-jscoverag binary - ' +
                              'https://github.com/visionmedia/node-jscoverage');
            }

            throw err;
          }

          runner.runTests.apply(runner, runnerArgs);
        });
      }
      else {
        runner.runTests.apply(runner, runnerArgs);
      }
    }
    else {
      runner.runTests.apply(runner, runnerArgs);
    }

  }
  else if (!p._halted) {
    console.log(p.banner);
  }

  process.on('SIGINT', function onSigint() {
    runner.forceStop();
  });

  process.on('exit', function() {
    process.reallyExit(exports.exitCode);
  });
}

exports.run = run;
