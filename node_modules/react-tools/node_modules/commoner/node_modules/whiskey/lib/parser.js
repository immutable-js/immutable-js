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

var optparse = require('./extern/optparse/lib/optparse');

var constants = require('./constants');
var run = require('./run');

var halt = function(parser) {
  parser.halt(parser);
  parser._halted = true;
  run.exitCode = 1;
};

var getParser = function(options) {
  var switches = [];

  switches = switches.concat(constants.DEFAULT_OPTIONS);
  switches = switches.concat(options);
  var parser = new optparse.OptionParser(switches);
  parser._options = options;

  parser.on('help', function() {
    util.puts(parser.toString());
    halt(parser);
  });

  parser.on('version', function() {
    util.puts(constants.VERSION);
    halt(parser);
  });

  parser.on(function(opt) {
    util.puts('No handler was defined for option: ' + opt);
    halt(parser);
  });

  parser.on('*', function(opt, value) {
    util.puts('wild handler for ' + opt + ', value=' + value);
    halt(parser);
  });

  return parser;
};

var getParserOptionsObject = function(options) {
  var i, option, split, optionName, optionType;
  var optionsLen = options.length;
  var optionsObj = {};

  for (i = 0; i < optionsLen; i++) {
    option = options[i][1];
    split = option.split(' ');

    optionName = split[0].replace(/\-\-/, '');
    if (split.length === 1) {
      optionType = 'boolean';
    }
    else {
      optionType = 'value';
    }

    optionsObj[optionName] = optionType;
  }

  return optionsObj;
};

var parseArgv = function(parser, argv) {
  var optionName, optionType;
  var optionsObj = getParserOptionsObject(parser._options);
  var options = {};

  function handleParserOption(optionName, optionType) {
    parser.on(optionName, function(opt, value) {
      if (optionType === 'boolean') {
          options[optionName] = true;
        }
        else if (optionType === 'value') {
          if (value) {
            options[optionName] = value;
          }
        }
      });
  }

  for (optionName in optionsObj) {
    if (optionsObj.hasOwnProperty(optionName)) {
      optionType = optionsObj[optionName];
      handleParserOption(optionName, optionType);
    }
  }

  parser.parse(argv);
  return options;
};

exports.getParser = getParser;
exports.parseArgv = parseArgv;
