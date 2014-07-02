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
 *
 */

var util = require('util');

/**
 * A class which represents a test error.
 *
 * @param {String} errName Error name.
 * @param {Error} err Original error object.
 *
 * @constructor
 */
function TestError(errName, err) {
  this.errName = errName;

  if (err) {
    this.message = err.message;
    this.stack = err.stack;
    this.arguments = err.arguments;
    this.type = err.type;
  }
}

util.inherits(TestError, Error);

exports.TestError = TestError;
