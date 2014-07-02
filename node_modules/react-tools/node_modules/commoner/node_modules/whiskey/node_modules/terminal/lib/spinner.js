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
var tty = require('tty');

var sprintf = require('sprintf').sprintf;

var dots = ['|', '/', '-', '\\'];

/**
 * Display a prompt followed by a little spinning character. Call tick
 * repeatedly to update.
 * @constructor
 * @param {String} prompter The prompt string.
 */
function Spinner(prompter) {
  this.ticks = 0;
  this.promptstr = prompter;
}

/**
 * Start the spinner.
 */
Spinner.prototype.start = function() {
  process.stdout.write('\n' + this.promptstr + '  ');
  this.tick();
};

/**
 * Update the spinner with the given character, internal use only.
 *
 * @param {String} c  The character to set.
 */
Spinner.prototype.update = function(c) {
  process.stdout.write('\b' + c);
};

/**
 * Call this repeatedly to spin the spinner.
 */
Spinner.prototype.tick = function() {
  this.ticks++;
  var c = dots[this.ticks % dots.length];
  this.update(c);
};

/**
 * End the spinner.
 */
Spinner.prototype.end = function() {
  process.stdout.write('\n');
};

/**
 * Show a prompt followed by an updating percentage value.
 * @constructor
 * @param {String} prompter The prompt string.
 * @param {Number} max  The value to use for 100%.
 */
function PercentSpinner(prompter, max) {
  this.max = max;
  this.current = 0;
  this.promptstr = prompter;
}

/**
 * Start the spinner.
 */
PercentSpinner.prototype.start = function() {
  process.stdout.write('\n' + this.promptstr + '       ');
  this.tick(0);
};

/**
 * Set the given percentage string, internal use only.
 *
 * @param {String} c  The percentage string to set.
 */
PercentSpinner.prototype.update = function(c) {
  process.stdout.write('\b\b\b\b\b' + c);
};

/**
 * Update the spinner. Call this repeatedly with new values as they become
 * available.
 *
 * @param {Number} value  The current value to set the spinner to.
 */
PercentSpinner.prototype.tick = function(value) {
  this.current = value;
  var p = (this.current / this.max) * 100;
  this.update(sprintf('%4d%%', p));
};

/**
 * End the spinner.
 */
PercentSpinner.prototype.end = function() {
  process.stdout.write('\n');
};

/**
 * Show prompt, and on the next line an updating percentage value and bar.
 * @constructor
 * @param {String} prompter The prompt string.
 * @param {Number} max  The value to use for 100%.
 */
function PercentBarSpinner(prompter, max) {
  this.current = 0;
  this.max = max;
  this.promptstr = prompter;
}

/**
 * Start the spinner.
 */
PercentBarSpinner.prototype.start = function() {
  process.stdout.write(this.promptstr + '\n');
  this.tick(0);
};

/**
 * Rewrite the current line, internal use only.
 *
 * @param {String} line The line to update to.
 */
PercentBarSpinner.prototype.update = function(line) {
  process.stdout.write('\r' + line);
};

/**
 * Update the spinner value.
 *
 * @param {Number} value  The new value to use.
 */
PercentBarSpinner.prototype.tick = function(value) {
  this.current = value;
  var bar = this.barstr();
  var val = this.percent();
  this.update(sprintf(' %4d%%', val) + ' [' + this.barstr() + '] ');
};

/**
 * End the spinner.
 */
PercentBarSpinner.prototype.end = function() {
  process.stdout.write('\n');
};

/**
 * Get the width to use for the inside of the percentage bar.
 *
 * @return {Number} The width in columns.
 */
PercentBarSpinner.prototype.width = function() {
  return tty.getWindowSize()[1] - 10;
};

/**
 * Get the current percentage value.
 *
 * @return {Number} The percentage value.
 */
PercentBarSpinner.prototype.percent = function() {
  return (this.current / this.max) * 100;
};

/**
 * Get the string to use for the inside of the percentage bar.
 *
 * @return {String} The percentage bar string.
 */
PercentBarSpinner.prototype.barstr = function() {
  var width = this.width();
  var p = Math.floor((this.current / this.max) * width);
  if (p >= width) {
    return new Array(width + 1).join('=');
  }
  else {
    var offset = p === 0 ? -1 : 0;
    return new Array(p).join('=') + '>' + new Array(width - p + offset + 1).join(' ');
  }
};

exports.normalSpinner = function(prompter) {
  return new Spinner(prompter);
};

exports.percentSpinner = function(prompter, max) {
  return new PercentSpinner(prompter, max);
};

exports.percentBarSpinner = function(prompter, max) {
  return new PercentBarSpinner(prompter, max);
};
