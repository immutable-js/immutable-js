/*
 * Licensed to Paul Querna under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Paul Querna licenses this file to You under the Apache License, Version 2.0
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

var graylog = require('./graylog');

function LoggerProxy(modulename) {
  this.modulename =  modulename;
  this.loglevel = -1;
}

/* Based on the Log levels available in Apache HTTP Server. */
exports.EMERG = 0;    /* system is unusable */
exports.ALERT = 1;    /* action must be taken immediately */
exports.CRIT = 2;     /* critical conditions */
exports.ERR = 3;      /* error conditions */
exports.WARNING = 4;  /* warning conditions */
exports.NOTICE = 5;   /* normal but significant condition */
exports.INFO = 6;     /* informational */
exports.DEBUG = 7;    /* debug-level messages */
exports.TRACE1 = 8;   /* trace-level 1 messages */
exports.TRACE2 = 9;   /* trace-level 2 messages */
exports.TRACE3 = 10;  /* trace-level 3 messages */
exports.TRACE4 = 11;  /* trace-level 4 messages */
exports.TRACE5 = 12;  /* trace-level 5 messages */
exports.TRACE6 = 13;  /* trace-level 6 messages */
exports.TRACE7 = 14;  /* trace-level 7 messages */
exports.TRACE8 = 15;  /* trace-level 8 messages */

var log_levels = ["EMERG",
                  "ALERT",
                  "CRIT",
                  "ERR",
                  "WARNING",
                  "NOTICE",
                  "INFO",
                  "DEBUG",
                  "TRACE1",
                  "TRACE2",
                  "TRACE3",
                  "TRACE4",
                  "TRACE5",
                  "TRACE6",
                  "TRACE7",
                  "TRACE8"];

var log_aliases = {"WARN": "WARNING",
                   "ERROR": "ERR",
                   "DBG": "DEBUG",
                   "MSG": "INFO",
                   "TRACE": "TRACE1"};

var known_sinks = {};
var known_loggers = [];
var known_routes = [];
var rewriters = [];

function applyRewrites(modulename, level, msg, extra) {
  var i;
  for (i = 0; i < rewriters.length; i++) {
    extra = rewriters[i](modulename, level, msg, extra);
  }
  return extra;
}

function buildLogMethod(modulename, level, callback) {
  if (level >= exports.TRACE1) {
    return function (msg, extra) {
      if (!extra) {
        extra = {};
      }
      extra['full_message'] = new Error('Backtrace').stack;
      extra = applyRewrites(modulename, level, msg, extra);
      callback(modulename, level, msg, extra)
    }
  }
  else {
    return function (msg, extra) {
      if (!extra) {
        extra = {};
      }
      extra = applyRewrites(modulename, level, msg, extra);
      callback(modulename, level, msg, extra)
    }
  }
}


function applyFormatString(msg, extra) {
  function replaceFunction(str, p1) {
    if (extra.hasOwnProperty(p1)) {
      return extra[p1];
    }

    return p1;
  }
  var regex = new RegExp(/\$\{(.*?)\}/g);
  msg = msg.replace(regex, replaceFunction);
  return msg;
}

function buildFormattedLogMethod(modulename, level, callback) {
  if (level >= exports.TRACE1) {
    return function (msg, extra) {
      if (!extra) {
        extra = {};
      }
      extra['full_message'] = new Error('Backtrace').stack;
      extra = applyRewrites(modulename, level, msg, extra);
      msg = applyFormatString(msg, extra);
      callback(modulename, level, msg, extra)
    }
  }
  else {
    return function (msg, extra) {
      if (!extra) {
        extra = {};
      }
      extra = applyRewrites(modulename, level, msg, extra);
      msg = applyFormatString(msg, extra);
      callback(modulename, level, msg, extra)
    }
  }
}


function nullLogger() {
  /* Intentionally blank. */
}

function applyRoute(route, logger, modulename) {
  logger.loglevel = route.loglevel;
  for(var i=0; i<log_levels.length; i++) {
    var level = log_levels[i];
    var v = exports[level];
    var llstr = level.toLowerCase();

    if (v <= route.loglevel) {
      logger[llstr] = buildLogMethod(modulename, v, route.callback);
      logger[llstr + 'f'] = buildFormattedLogMethod(modulename, v, route.callback);
    }
    else {
      logger[llstr] = nullLogger;
      logger[llstr + 'f'] = nullLogger;
    }
  }

  for (var key in log_aliases) {
    if (log_aliases.hasOwnProperty(key)) {
      logger[key.toLowerCase()] = logger[log_aliases[key].toLowerCase()];
      logger[key.toLowerCase() + 'f'] = logger[log_aliases[key].toLowerCase() + 'f'];
    }
  }
}

function routeMatch(a, b) {
  var as = a.split('.');
  var bs = b.split('.');
  var i = 0;

  while(true) {
    if (as.length < i || bs.length < i) {
      break;
    }
    if (as[i] == bs[i]) {
      if (as.length == i) {
        return true;
      }
      i++;
      continue;
    }

    if (as[i] == "*") {
      return true;
    }

    break;
  }
  return false;
}

function applyRoutes(logger) {
  for(var i=0; i < known_routes.length; i++) {
    var r = known_routes[i];
    if (r.route == "__root__") {
      applyRoute(r, logger, logger.modulename);
    }
    else if (routeMatch(r.route, logger.modulename)) {
      applyRoute(r, logger, logger.modulename);
    }
  }
}

exports.local = function(modulename) {
  var logger = new LoggerProxy(modulename);
  applyRoutes(logger);
  known_loggers.push(logger);
  return logger;
};

exports.registerSink = function(sinkname, callback) {
  known_sinks[sinkname] = callback;
};

exports.route = function(match, loglevel, sinkname) {

  if (!(loglevel >= exports.EMERG && loglevel <= exports.TRACE8)) {
    throw new Error("Invalid Log level: " + loglevel);
  }

  /* TODO: Maybe it is okay to route before we have a sink loaded (?) */
  if (known_sinks[sinkname] === undefined) {
    throw new Error("Invalid Sink: " + sinkname);
  }

  known_routes.push({route: match, loglevel: loglevel, callback: known_sinks[sinkname]});

  for(var i=0; i<known_loggers.length; i++) {
    var logger = known_loggers[i];
    applyRoutes(logger);
  }
};

exports.addRewriter = function(func) {
  rewriters.push(func);
};

exports.clearRewriter = function(func) {
  rewriters.pop(func);
};

(function() {
  /* Default Sinks */

  /* This is just here for initial dev work, REMOVE ME */
  exports.registerSink("console", function(modulename, level, message, obj) {
    if (obj) {
      /* TODO: improve */
      var fm = obj['full_message'] ? "\n  " + obj['full_message'] : "";
      obj['full_message'] = undefined;
      console.log(modulename +": "+ message + " " + JSON.stringify(obj) + fm);
    }
    else {
      console.log(modulename +": "+ message);
    }
  });

  exports.registerSink("graylog2-stderr", function(modulename, level, message, obj) {
    /* Outputs a GLEF-style JSON to stderr */
    var str = graylog.logstr(modulename, level, message, obj);
    process.stderr.write(str + "\n");
  });

  /* Default loggers */
  exports.route("__root__", exports.INFO, "console");
})();
