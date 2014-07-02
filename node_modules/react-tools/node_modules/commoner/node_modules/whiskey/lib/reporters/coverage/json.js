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
var fs = require('fs');

var coverage = require('./../../coverage');
var CoverageReporter = require('./base').CoverageReporter;

function JSONReporter(tests, options) {
  CoverageReporter.call(this, tests, options);

  this._coverage = {};
  this._coverageFile = this._options['file'];
}

JSONReporter.prototype.handleTestFileComplete = function(filePath, coverageObj) {
  var filename = filePath;
  this._coverage[filename] = coverageObj;
};

JSONReporter.prototype.handleTestsComplete = function(coverageObj) {
  var filePath;
  var coverage = coverageObj || this._coverage;
  var data = JSON.stringify(coverage);

  if (this._coverageFile.indexOf('/') === 0) {
    filePath = this._coverageFile;
  }
  else {
    filePath = path.join(process.cwd(), this._coverageFile);
  }

  fs.writeFileSync(filePath, data, 'utf8');
};

exports.name = 'json';
exports.klass = JSONReporter;
