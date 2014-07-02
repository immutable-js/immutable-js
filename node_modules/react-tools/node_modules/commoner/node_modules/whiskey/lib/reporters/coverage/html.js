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
var path = require('path');
var fs = require('fs');

var rimraf = require('rimraf');
var templates = require('magic-templates');

var constants = require('./../../constants');
var coverage = require('./../../coverage');
var CoverageReporter = require('./base').CoverageReporter;

function HtmlReporter(tests, options) {
  CoverageReporter.call(this, tests, options);

  if (!options['directory']) {
    throw new Error('Missing coverage-directory option');
  }

  this._coverage = {};

  this._coverageDirectory = this._options['directory'];
  this._assetsDirectory = path.join(__dirname, '../../../', 'assets');

  templates.setTemplatesDir(this._assetsDirectory);
  templates.setDebug(false);
}

HtmlReporter.prototype.handleTestFileComplete = function(filePath, coverageObj) {
  var filename = filePath;
  this._coverage[filename] = coverageObj;
};

HtmlReporter.prototype.handleTestsComplete = function(coverageObj) {
  coverageObj = (!coverageObj) ? coverage.populateCoverage(null, this._coverage) : coverageObj;
  this._writeCoverage(coverageObj);
};

HtmlReporter.prototype._writeCoverage = function(cov) {
  var self = this;

  /* Remove output directory */
  rimraf(self._coverageDirectory, function(err) {
    fs.mkdir(self._coverageDirectory, 0755, function() {
      self._writeFile(cov);
      self._writeSourceFiles(cov);
      self._writeStaticFiles(self._coverageDirectory);
    });
  });
};

HtmlReporter.prototype._writeFile = function(cov) {
  var self = this;
  var template = new templates.Template('whiskey.magic');

  var context = {
    version: constants.VERSION,
    coverage: cov.coverage,
    cov: cov
  };

  template.load(function(err, template) {
    if (err) {
      // load/parse errors (invalid filename, bad template syntax)
      console.log(err);
    }
    else {
      template.render(context, function(err, output) {
        if (err) {
          // render errors (invalid filename in context variables, bad context variables)
          console.log(err);
        }
        else {
          fs.writeFile(path.join(self._coverageDirectory, 'index.html'),
                       output.join(''));
        }
      });
    }
  });
};

HtmlReporter.prototype._writeSourceFiles = function(cov) {
  var self = this;
  var template = new templates.Template('whiskey_source.magic');

  template.load(function(err, template) {
    if (err) {
      // load/parse errors (invalid filename, bad template syntax)
      console.log(err);
    }
    else {
      for (var name in cov.files) {
        var context = {
          version: constants.VERSION,
          name: name,
          cov: cov.files[name],
          markup: self._generateSourceMarkup(cov.files[name])
        };

        template.render(context, function(err, output) {
          if (err) {
            // render errors (invalid filename in context variables, bad context variables)
            console.log(err);
          }
          else {
            fs.writeFile(path.join(self._coverageDirectory,
                                   cov.files[name].htmlName),
                         output.join(''));
          }
        });
      }
    }
  });
};

HtmlReporter.prototype._generateSourceMarkup = function(cov) {
  var rv = [], _class, data, source;

  for (var i = 1, linesLen = (cov.source.length + 1); i < linesLen; i++) {
    data = cov.lines[i.toString()];
    _class = 'pln';
    if (data !== null) {
      if (parseInt(data, 10) > 0) {
        _class = 'stm run';
      }
      else if (parseInt(data, 10) === 0) {
        _class = 'stm mis';
      }
    }
    source = cov.source[i-1];
    source = source.replace(/\s/g, '&nbsp;');
    rv.push({number: i, css: _class, source: source});
  }

  return rv;
};

HtmlReporter.prototype._writeStaticFiles = function(dest) {
  this._copyAsset('style.css', dest);
  this._copyAsset('coverage_html.js', dest);
  this._copyAsset('jquery-1.4.3.min.js', dest);
  this._copyAsset('jquery.tablesorter.min.js', dest);
  this._copyAsset('jquery.isonscreen.js', dest);
  this._copyAsset('jquery.hotkeys.js', dest);
  this._copyAsset('keybd_closed.png', dest);
  this._copyAsset('keybd_open.png', dest);
};

HtmlReporter.prototype._copyAsset = function(asset, dest) {
  this._copyFile(path.join(this._assetsDirectory, asset),
                 path.join(dest, asset));
};

HtmlReporter.prototype._copyFile = function(src, dst) {
  var oldFile = fs.createReadStream(src);
  var newFile = fs.createWriteStream(dst);

  newFile.once('open', function(fd) {
    util.pump(oldFile, newFile);
  });
};

exports.name = 'html';
exports.klass = HtmlReporter;
