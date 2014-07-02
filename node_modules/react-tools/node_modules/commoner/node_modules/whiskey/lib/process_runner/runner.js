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

var fs = require('fs');
var path = require('path');
var net = require('net');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

var sprintf = require('sprintf').sprintf;
var term = require('terminal');
var async = require('async');
var Set = require('simplesets').Set;
var logmagic = require('logmagic');
var log = require('logmagic').local('whiskey.process_runner.runner');

var util = require('../util');

// Set up logging
function sink(modulename, level, message, obj) {
  term.puts(sprintf('[green]%s[/green]: %s', modulename, message));
}

logmagic.registerSink('process_runner', sink);

var VALID_WAIT_FOR_OPTIONS = {
  'none': {
    'required_options': new Set([]),
  },

  'stdout': {
    'required_options': new Set(['string']),
  },

  'socket': {
    'required_options': new Set(['host', 'port'])
  }
};

var VALID_WAIT_FOR_OPTIONS_NAMES = Object.keys(VALID_WAIT_FOR_OPTIONS);

var DEFAULT_TIMEOUT = 10 * 1000;
var COVERAGE_KILL_DELAY = 1500;

var SOCKET_CONNECT_TIMEOUT = 1000;
var SOCKET_CONNECT_INTERVAL = 100;


/**
 * @param {String} configPath comma delimited string of config paths.
 */
function ProcessRunner(configPath) {
  var i, configPaths, configPath, config = {};

  configPaths = configPath.split(',');

  // Assume all the configs are located in the same directory
  this._configPath = path.resolve(configPaths[0]);

  for (i = 0; i < configPaths.length; i++) {
    configPath = path.resolve(configPaths[i]);
    config = util.merge(config, this._readConfigFile(configPath));
  }

  this._config = this.verifyConfig(config);

  this._stopped = false;
  this._processes = [];
}


ProcessRunner.prototype._readConfigFile = function(filePath) {
  var config = JSON.parse(fs.readFileSync(filePath));
  return config;
};


/**
 * Inspect the config, make sure all the options are valid and return a cleaned
 * config object.
 *
 * @return {Object} Cleaned config, object with which we can work.
 */
ProcessRunner.prototype.verifyConfig = function(config) {
  var key, value, available = {}, waitForOptions, requiredOptions, missing, dependencies,
      i, len, component, components, cleaned = {};

  // Verify that all the specified dependencies are defined
  for (key in config) {
    if (config.hasOwnProperty(key)) {
      value = config[key];
      available[key] = true;

      if (!value.cmd) {
        throw new Error(sprintf('%s is missing "cmd" attribute!', key));
      }

      if (value.wait_for) {
        if (!VALID_WAIT_FOR_OPTIONS.hasOwnProperty(value.wait_for)) {
          throw new Error(sprintf('Invalid wait_for options "%s", valid' +
                                  ' options are: %s', value.wait_for,
                                  VALID_WAIT_FOR_OPTIONS_NAMES));
        }

        waitForOptions = new Set(Object.keys(value.wait_for_options || {}));
        requiredOptions = VALID_WAIT_FOR_OPTIONS[value.wait_for].required_options;

        missing = requiredOptions.difference(waitForOptions).array();

        if (missing.length !== 0) {
          throw new Error(sprintf('Missing required option for "%s" ' +
                                  'wait_for. Required options are: %s', value.wait_for,
                                   requiredOptions.array()));
        }

      }
    }
  }

  // Verify dependencies exist
  for (key in config) {
    if (config.hasOwnProperty(key)) {
      value = config[key];
      dependencies = value.depends || [];

      dependencies.forEach(function(name) {
        if (!available.hasOwnProperty(name)) {
          throw new Error(sprintf('%s is depending on "%s" which is not' +
                                  ' defined', key, name));
        }
        else if (name === key) {
          throw new Error(sprintf('%s cannot depend on itself', key));
        }
      });

      cleaned[key] = {};
      cleaned[key]['name'] = key;
      cleaned[key]['cmd'] = value.cmd;
      cleaned[key]['log_file'] = this._getLogFilePath(key, value.log_file);
      cleaned[key]['wait_for'] = value.wait_for || null;
      cleaned[key]['wait_for_options'] = (value.wait_for) ? value.wait_for_options : {};
      cleaned[key]['available_for_coverage'] = value.available_for_coverage || false;
      cleaned[key]['kill_script'] = value.kill_script || null;
      cleaned[key]['timeout'] = parseInt(value.timeout || DEFAULT_TIMEOUT, 10);
      cleaned[key]['depends'] = value.depends || [];

      if (value.cwd && value.cwd.length > 0) {
        components = [];

        for (i = 0, len = value.cwd.length; i < len; i++) {
          component = value.cwd[i];

          if (component === '__dirname') {
            component = path.dirname(this._configPath);
          }

          components.push(component);
        }

        cleaned[key]['cwd'] = path.resolve(path.join.apply(path, components));
      }
      else {
        cleaned[key]['cwd'] = null;
      }
    }
  }

  return cleaned;
};

ProcessRunner.prototype._getLogFilePath = function(name, logFile) {
  var cwd = process.cwd();

  if (logFile) {
    return logFile;
  }

  return path.join(cwd, sprintf('%s.log', name));
};

/**
 * Scan the test files and find all the dependencies.
 *
 * @param {Function} Callback called with (err, {Array}dependencies).
 */
ProcessRunner.prototype.findDependencies = function(testPaths, callback) {
  var self = this, exportedDependencies = new Set([]), dependencies;

  async.forEach(testPaths, function(testPath, callback) {
    var testModule = testPath.replace(/\.js$/, ''), exported;

    try {
      exported = require(testModule);
    }
    catch (err) {
      callback();
      return;
    }

    if (exported.hasOwnProperty('dependencies')) {
      exported.dependencies.forEach(function(name) {
        if (!self._config.hasOwnProperty(name)) {
          throw new Error(sprintf('File "%s" depends on process "%s" which does not exist',
                                  testPath, name));
        }

        exportedDependencies.add(name);
      });
    }

    callback();
  },

  function(err) {
    dependencies = exportedDependencies.array();
    callback(err, dependencies);
  });
};

/**
 *
 * @param {?Array} names Names of the dependencies to run. Defaults to all the
 * dependencies specified in the config file.
 * @param {Function} callback Callback called when all the processes have
 * started.
 */
ProcessRunner.prototype.start = function(names, callback) {
  var self = this, i, len, name, value, ops = {}, dependencies, func;

  if (typeof names === 'function') {
    callback = names;
    names = Object.keys(this._config);
  }
  else {
    names = names || Object.keys(this._config);
  }

  for (i = 0, len = names.length; i < len; i++) {
    name = names[i];

    if (this._config.hasOwnProperty(name)) {
      value = this._config[name];
      name = value.name;
      dependencies = value.depends;

      func = this._startProcess.bind(this, value);

      if (dependencies.length === 0) {
        ops[name] = func;
      }
      else {
        ops[name] = dependencies.concat([func]);
      }
    }
  }

  async.auto(ops, function(err) {
    if (err) {
      self.stop(function(err2) {
        err = err2 || err;
        callback(err);
      });
      return;
    }

    callback();
  });
};

/**
 * Stop all the running processes.
 */
ProcessRunner.prototype.stop = function(callback) {
  if (!callback) {
    callback = function() {};
  }

  if (this._stopped) {
    callback();
    return;
  }

  this._stopped = true;
  async.forEach(this._processes, this._stopProcess.bind(this), callback);
};


/**
 * Start a single process.
 *
 * @param {Object} options Options.
 * @param {Function} callback Callback called when the process has been started
 * with (err).
 */
ProcessRunner.prototype._startProcess = function(options, callback) {
  var self = this, args = options.cmd, logFilePath = options.log_file,
      waitFor = options.wait_for, waitForOptions = options.wait_for_options, obj;

  function writeToLog(stream, chunk) {
    if (stream.writable) {
      stream.write(chunk, 'utf8');
    }
  }

  function handleTimeout(obj, callback) {
    self._stopProcess(obj, function() {
      callback(new Error(sprintf('Process "%s" failed to start in %s seconds.',
                                 options.name, (options.timeout / 1000))));
    });
  }


  if (this._stopped) {
    callback(new Error('Runner has been stopped.'));
    return;
  }

  async.waterfall([
    function createDataStructure(callback) {
      var logFileStream = fs.createWriteStream(logFilePath, {'flags': 'w', 'encoding': 'utf8'});

      obj = {
        'name': options.name,
        'log_file_stream': logFileStream,
        'available_for_coverage': options.available_for_coverage,
        'kill_script': options.kill_script,
        'started_at': util.getUnixTimestamp()
      };

      callback();
    },

    function spawnProcess(callback) {
      var cmd = args.splice(0, 1)[0],
          spawnArgs = [cmd, args],
          spawnOptions, child;

      if (options.cwd) {
        spawnOptions = {'cwd': options.cwd};
        spawnArgs.push(spawnOptions);
      }

      log.infof('Starting [bold]${name}[/bold] process, cmd: ' +
                '[bold]${cmd}[/bold]...', {'name': options.name,
                                           'cmd': [cmd, args].join(' ')});

      child = spawn.apply(null, spawnArgs);

      obj.process = child;
      child.stdout.on('data', writeToLog.bind(null, obj.log_file_stream));
      child.stderr.on('data', writeToLog.bind(null, obj.log_file_stream));

      child.on('exit', function onExit(code) {
        if (obj.killed) {
          log.debugf('Process [bold]${name}[/bold] exited with code ${code}',
                  {'name': options.name, 'code': code});
        } else {
          log.infof('Process [bold]${name}[/bold] exited with code ${code}',
                  {'name': options.name, 'code': code});
        }
      });

      self._processes.push(obj);
      callback();
    },

    function setTimeoutAndWaitFor(callback) {
      var timeoutId;

      function wrappedCallback() {
        clearTimeout(timeoutId);
        callback();
      }

      if (!waitFor) {
        callback();
      }
      else if (waitFor === 'stdout' || waitFor === 'socket') {
        timeoutId = setTimeout(handleTimeout.bind(null, obj, callback),
                               options.timeout);

        if (waitFor === 'stdout') {
          self._waitForStdout(obj, waitForOptions, wrappedCallback);
        }
        else if (waitFor === 'socket') {
          self._waitForSocket(obj, waitForOptions, wrappedCallback);
        }
      }
    }
  ], callback);
};

/**
 * @param {Object} process Process options object.
 * @param {Function} callback Callback called on completion.
 */
ProcessRunner.prototype._stopProcess = function(process, callback) {
  log.infof('Stopping [bold]${name}[/bold] process...', {'name': process.name});

  if (process.log_file_stream.writable) {
    process.log_file_stream.end('');
  }

  process.process.stdout.removeAllListeners('data');
  process.process.stderr.removeAllListeners('data');

  if (!process.available_for_coverage) {
    if (!process.kill_script) {
      process.process.kill('SIGKILL');
    }
    else {
      exec(process.kill_script, function() {});
    }
  }
  else {
    process.process.kill('SIGUSR2')
  }

  process.killed = true;
  process.stopped_at = util.getUnixTimestamp();
  callback();
};

/**
 * @param {Object} obj Process object.
 * @param {Object} options Options object.
 * @param {Function} callback Callback called when the matching string has been
 * found.
 */
ProcessRunner.prototype._waitForStdout = function(obj, options, callback) {
  var stdoutBuffer = '';

  function onData(chunk) {
    stdoutBuffer += chunk;

    if (stdoutBuffer.indexOf(options.string) !== -1) {
      // Found matching string
      process.stdout.removeListener('data', onData);
      process.stderr.removeListener('data', onData);
      callback();
    }
  }

  obj.process.stdout.on('data', onData);
  obj.process.stderr.on('data', onData);
};

/**
 *
 * @param {Object} obj Process object.
 * @param {Object} options Options object.
 * @param {Function} callback Callback called when the connection has been
 * established.
 */
ProcessRunner.prototype._waitForSocket = function(obj, options, callback) {
  callback = util.fireOnce(callback);
  var host = options.host, port = options.port;

  function connect() {
    if (obj.killed) {
      callback();
      return;
    }

    var socket = net.createConnection(port, host), timeoutId;

    timeoutId = setTimeout(function() {
      setTimeout(connect, 2000);
      socket.destroy();
    }, SOCKET_CONNECT_TIMEOUT);

    socket.on('connect', function(con) {
      clearTimeout(timeoutId);
      socket.end();
      callback();
    });

    socket.on('error', function(err) {
      clearTimeout(timeoutId);
      setTimeout(connect, SOCKET_CONNECT_INTERVAL);
    });
  }

  connect();
};

exports.ProcessRunner = ProcessRunner;
