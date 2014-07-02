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

var os = require('os');

var logobj = {
  version: "1.0",
  host: os.hostname(),
  timestamp: null,
  short_message: null,
  full_message: null,
  timestamp: null,
  level: null,
  facility: null,
};

var logcache = {};

function clone(obj) {
  /* Shallow object clone */
  var target = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      target[i] = obj[i];
    }
  }
  return target;
}

exports.logstr = function(module, level, message, obj) {

  if (level > 7) {
    level = 7;
  }

  var l = null;

  if (obj) {
    /* begin fucking voodoo */

    /**
     * The 'easy' way to do this, is to create a new
     * object every time:
     *  l = clone(logobj);
     *
     * But because of how node stores things in its slots,
     * this is about 50% as fast as this hack using the keys
     * of an object to store only one instance of it....
     *
     * The observation we make is that most applications have a
     * limited set of parameters that they pass into be logged,
     * and the 'key' to this log object is almost always a static
     * string.
     */
    var keys = "";
    /* This is faster than Object.keys(obj).join(""); */
    for (var i in obj) {
      keys += i;
    }

    l = logcache[keys];
    if (!l) {
      l = clone(logobj);
      logcache[keys] = l;
    }

    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (i == 'full_message') {
          l['full_message'] = obj[i];
        }
        else {
          l["_" + i] = obj[i];
        }
      }
    }
  }
  else {
    l = logobj;
  }


  l.facility = module;
  l.timestamp = (new Date().getTime()) / 1000;
  l.short_message = message;
  l.level = level;
  
  return JSON.stringify(l);
}
