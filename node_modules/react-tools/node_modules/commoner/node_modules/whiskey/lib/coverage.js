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

/*
 * coverage and populateCoverage are taken from expresso
 *  <https://github.com/visionmedia/expresso> which is MIT licensed.
 *  Copyright(c) TJ Holowaychuk <tj@vision-media.ca>
 */

var path = require('path');
var fs = require('fs');

/*
 * Convert a _$jscoverage object so it's JSON serializable
 */
function stringifyCoverage(cov) {
  var i, files, file, fileObj, source;
  var tmp = {}, coverageObj = {};

  files = Object.keys(cov);

  for (i = 0; i < files.length; i++) {
    file = files[i];
    fileObj = cov[file];
    source = fileObj['source'];
    delete fileObj['source'];

    coverageObj[file] = {
      'lines': fileObj,
      'source': source
    };
  }

  return JSON.stringify(coverageObj);
}

/**
 * Total coverage for the given file data.
 *
 * @param  {Array} data
 * @return {Type}
 */
function coverage(data, type) {
  var comparisionFunc;
  var n = 0;

  function isCovered(val) {
    return (val > 0);
  }

  function isMissed(val) {
    return !isCovered(val);
  }

  if (type === 'covered') {
    comparisionFunc = isCovered;
  }
  else if (type === 'missed') {
    comparisionFunc = isMissed;
  }
  else {
    throw new Error('Invalid type: ' + type);
  }

  for (var i = 0, len = data.lines.length; i < len; ++i) {
    if (data.lines[i] !== null && comparisionFunc(data.lines[i])) {
      ++n;
    }
  }

  return n;
}

function getEmptyResultObject() {
  var results = {};

  results.LOC = 0;
  results.SLOC = 0;
  results.totalFiles = 0;
  results.totalHits = 0;
  results.totalMisses = 0;
  results.coverage = 0;
  results.files = {};

  return results;
}

/**
 * @param {?Object} results Optional results object. If it's not provided it will be created.
 * @param {?Object} cov coverage object.
 */
function populateCoverage(results, cov) {
  var linesLen;

  results = (!results) ? getEmptyResultObject() : results;

  /* Aggregate data from all files */
  for (var testfile in cov) {
    for (var name in cov[testfile]) {
      var file = cov[testfile][name], file_stats;

      file_stats = results.files[name] || {
        name: name,
        htmlName: name.replace('.js', '.html').replace('.java', '.html').replace(/\/|\\/g, '_'),
        totalHits: 0,
        totalMisses: 0,
        totalLines: 0,
        lines: null,
        source: null
      };

      if (file_stats.lines === null) {
        file_stats.lines = file.lines;
      }
      else {
        linesLen = file.lines.length;
        for (var i = 0; i < linesLen; i++) {
          if (file.lines[i] !== null) {
            if (file_stats.lines[i] === null) {
              file_stats.lines[i] = file.lines[i];
            }
            else {
              file_stats.lines[i] += file.lines[i];
            }
          }
        }
      }

      if (file_stats.source === null) {
        file_stats.source = file.source;
      }

      results.files[name] = file_stats;
    }
  }

  /* Calculate statistics */
  for (var name in results.files) {
    var file_stats = results.files[name];

    // File level statistics
    file_stats.totalHits = coverage(file_stats, 'covered');
    file_stats.totalMisses = coverage(file_stats, 'missed');
    file_stats.totalLines = file_stats.totalHits + file_stats.totalMisses;
    file_stats.coverage = (file_stats.totalHits / file_stats.totalLines) * 100;
    file_stats.coverage = (isNaN(file_stats.coverage)) ? 0 : file_stats.coverage.toFixed(2);
    file_stats.LOC = file_stats.source.length;
    file_stats.SLOC = file_stats.totalLines;
    results.files[name] = file_stats;

    // Global statistic update
    results.totalHits += file_stats.totalHits;
    results.totalMisses += file_stats.totalMisses;
    results.totalFiles++;
    results.LOC += file_stats.LOC;
    results.SLOC += file_stats.SLOC;
  }

  /* Calculate covergage of tests */
  results.coverage = (results.totalHits / results.SLOC) * 100;
  results.coverage = results.coverage.toFixed(2);

  return results;
}

/**
 * Read multiple coverage files and return aggregated coverage.
 */
function aggregateCoverage(files) {
  var i, len, file, content, results;
  var resultsObj = getEmptyResultObject();

  for (i = 0, len = files.length; i < len; i++) {
    file = files[i];
    content = JSON.parse(fs.readFileSync(file).toString());
    resultsObj = populateCoverage(resultsObj, content);
  }

  return resultsObj;
}


function installCoverageHandler() {
  var pid = process.pid;
  var coverageDirectory = process.env['COVERAGE_DIRECTORY'];
  var coveragePath = path.join(coverageDirectory, pid + '.json');

  function writeCoverage() {
    var coverage = {};

    if (typeof _$jscoverage === 'object') {
      coverage[pid] = JSON.parse(stringifyCoverage(_$jscoverage));

      try {
        fs.writeFileSync(coveragePath, JSON.stringify(coverage), 'utf8');
      }
      catch (e) {}
    }

    process.exit();
  }

  if (coverageDirectory) {
    process.on('SIGUSR2', writeCoverage);
  }
}

exports.stringifyCoverage = stringifyCoverage;
exports.populateCoverage = populateCoverage;
exports.aggregateCoverage = aggregateCoverage;
exports.installCoverageHandler = installCoverageHandler;
