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

var path = require('path');

var term = require('terminal');
var sprintf = require('sprintf').sprintf;

var constants = require('./../constants');
var parser = require('./../parser');
var ProcessRunner = require('./runner').ProcessRunner;

function getRunnerInstance(configPath) {
  var runner;

  try {
    runner = new ProcessRunner(configPath);
  }
  catch (err) {
    term.puts(sprintf('Failed to load config file: [bold]%s[/bold]', err.message));
    process.exit(1);
  }

  return runner;
}

function run(argv) {
  var p, options, configPath, runner, names;

  p = parser.getParser(constants.PROCESS_RUNNER_OPTIONS);
  p.banner = 'Usage: process-runner --config dependencies.json [--verify|--run]';
  options = parser.parseArgv(p, argv);

  configPath = options.config || path.join(process.cwd(), 'dependencies.json');

  if (options['verify']) {
    runner = getRunnerInstance(configPath);
    term.puts('Config file looks OK.');
  }
  else if (options['run']) {
    runner = getRunnerInstance(configPath);
    names = options['names'] ? options['names'].split(',') : null;

    runner.start(names, function(err) {
      if (err) {
        term.puts('Failed to start processes!');
        term.puts(sprintf('Error: %s', err.message));
      }
      else {
        term.puts('All processes started');
      }
    });
  }
  else if (!p._halted) {
    console.log(p.banner);
  }

  process.on('SIGINT', function onSigint() {
    term.puts('Stopping all processes...');

    runner.stop(function() {
      term.puts('All processes stopped');
    });
  });
}

exports.run = run;
