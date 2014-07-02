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

var sprintf = require('sprintf').sprintf;

/* If true, formatting will be applied to all the text passed to the puts function. */

var VERSION = '0.1.2';

var USE_ANSI_CODES = true;

var PRINT_FUNC = util.print;
var PUTS_FUNC = util.puts;

var RAINBOW_STYLES = [
  [31, 39], // red
  [33, 39], // yelow
  [32, 39], // green
  [34, 39], // blue
];

/* Style table taken from the Node util module */
var STYLES = { 'bold' : [1, 22],
               'italic' : [3, 23],
               'underline' : [4, 24],
               'inverse' : [7, 27],
               'white' : [37, 39],
               'grey' : [90, 39],
               'black' : [30, 39],
               'blue' : [34, 39],
               'cyan' : [36, 39],
               'green' : [32, 39],
               'magenta' : [35, 39],
               'red' : [31, 39],
               'yellow' : [33, 39],
               'rainbow': RAINBOW_STYLES
};

/* An array of terminal which support ANSI escape codes */
var TERMINAL_SUPPORTS_ANSI_CODES = ['xterm', 'xterm-color', 'screen', 'vt100', 'vt100-color',
                                'xterm-256color'];

/*
 * Return total length of all the style tags in the provided string.
 *
 * @param {Number} Length of all the style tags in the provided string.
 */
function getStylesLength(string) {
  var i, styleNames, STYLESCount, style;
  var STYLESLength = 0;


  styleNames = Object.keys(STYLES);
  STYLESCount = styleNames.length;
  for (i = 0; i < STYLESCount; i++) {
    style = styleNames[i];
    if (string.indexOf(sprintf('[%s]', style)) !== -1 &&
        string.indexOf(sprintf('[/%s]', style)) !== -1) {
      STYLESLength += ((style.length * 2) + 5);
    }
  }

  return STYLESLength;
}

/**
 * Left pad the given string to the maximum width provided.
 *
 * @param  {String} str Input string.
 * @param  {Number} width Desired length.
 * @return {String} Left padded string.
 */
function lpad(str, width) {
  var n, STYLESLength;

  str = String(str);
  STYLESLength = getStylesLength(str);
  n = (width + STYLESLength) - str.length;

  if (n < 1) {
    return str;
  }

  while (n--) {
    str = ' ' + str;
  }

  return str;
}

/**
 * Right Pad the given string to the maximum width provided.
 *
 * @param  {String} str Input string.
 * @param  {Number} width Desired Lenght.
 * @return {String} Right padded string.
 */
function rpad(str, width) {
  var n, STYLESLength;

  str = String(str);
  STYLESLength = getStylesLength(str);
  n = (width + STYLESLength) - str.length;

  if (n < 1) {
    return str;
  }

  while (n--) {
    str = str + ' ';
  }

  return str;
}

/**
 * Print a formatted table to the standard output.
 *
 * @param {Array} columns Array of objects. Each object must contains the
 *     following properties (optional properties are marked with *):
 *     {String} title - column title
 *     {?String|?Array} valueProperty - name of the property in the rows object which
 *                                holds the value for this column.
 *                                If formatFunction is defined this value can
 *                                also be an array which will be passed to this
 *                                function.
 *     {?Number} paddingLeft - left pad the string to the width provided
 *     {?Number} paddingRight - right pad the string to the width provided
 *     {Function} formatFunction* - a function which is applied for each value
 *                                  of this column.
 *
 * @param {Array} rows Array of objects which hold the values for each column.
 * @param {String} noDataText The text which is printed to standard output if
 *                            the rows array is empty.
 */
function printTable(columns, rows, noDataText) {
  var i, valuePropertyLen, valueProperyItem;
  var string, columnTitle, valueProperty, value, paddingLeft, paddingRight;
  var _noDataText = noDataText || 'No data available';

  if (rows.length === 0) {
    PRINT_FUNC(_noDataText);
  } else {
    columns.forEach(function(column) {
      columnTitle = column.title;

      if (column.hasOwnProperty('paddingLeft')) {
        paddingLeft = column.paddingLeft;
      } else {
        paddingLeft = 0;
        column.paddingLeft = 0;
      }

      if (column.hasOwnProperty('paddingRight')) {
        paddingRight = column.paddingRight;
      } else {
        paddingRight = 0;
        column.paddingRight = 0;
      }

      string = lpad(columnTitle, paddingLeft);
      string = rpad(string, column.paddingRight);

      PRINT_FUNC(string);
    });

    PRINT_FUNC('\n');

    rows.forEach(function(row) {
      columns.forEach(function(column) {
        columnTitle = column.title;
        valueProperty = column.valueProperty || columnTitle.toLowerCase();
        value = row[valueProperty];

        if (column.hasOwnProperty('formatFunction')) {
          if (!(valueProperty instanceof Array)) {
            value = [ value ];
          }
          else {
            value = [];
            valuePropertyLen = valueProperty.length;
            for (i = 0; i < valuePropertyLen; i++) {
              valueProperyItem = valueProperty[i];
              value.push(row[valueProperyItem]);
            }
          }

          value = column.formatFunction.apply(null, value);
        }

        string = lpad(value, column.paddingLeft);
        string = rpad(string, column.paddingRight);

        PRINT_FUNC(string);
      });

      PRINT_FUNC('\n');
    });
  }

  PRINT_FUNC('\n');
}

/**
 * Print the provided text to stdout preceeded by the specified number of
 * spaces and wrapped, at spaces, to a maximum of the specified width.
 *
 * @param {String} text   The text to print.
 * @param {Number} width  The maximum line length, defaults to 80.
 * @param {Number} indent How many spaces to use as indent, defaults to 2.
 * @param {Function} outputFunction Output function (defaults to PUTS_FUNC).
 */
function printWrapped(text, width, indent, outputFunction) {
  var chunk, STYLESLength, splitIndex, remaining, indentstr;
  width = width || 80;
  indent = indent || 2;
  outputFunction = outputFunction || PUTS_FUNC;
  STYLESLength = getStylesLength(text);

  indentstr = new Array(indent + 1).join(' ');
  width = width + STYLESLength;
  remaining = text;

  while (remaining.length > (width - indent)) {
    chunk = remaining.slice(0, (width - indent));
    splitIndex = chunk.lastIndexOf(' ');
    chunk = chunk.slice(0, splitIndex);
    remaining = remaining.substr(splitIndex + 1);
    outputFunction(indentstr + chunk);
  }

  outputFunction(indentstr + remaining);
}

/*
 * Ask user a question and return the input.
 *
 * @param {String} question Question which is sent to standard output
 * @param {Array} validOptions Array of valid options (e.g. ['yes', 'no'])
 * @param {String} defaultOption Option which is used as a default if empty line is received
 * @param {Function} outputFunction Output function (defaults to PRINT_FUNC).
 * @param {Function} callback Callback which is called with user input
 */
function prompt(question, validOptions, defaultOption, outputFunction, callback) {
  outputFunction = outputFunction || PRINT_FUNC;
  var stdin = process.openStdin();
  stdin.resume();
  var options, option, questionMark, dataString;

  if (validOptions) {
    if (defaultOption && validOptions.indexOf(defaultOption) === -1) {
      throw new Error(sprintf('Invalid default option: %s', defaultOption));
    }

    option = (defaultOption) ? sprintf(' [%s]', defaultOption) : '';
    options = sprintf(' (%s)%s', validOptions.join('/'), option);
  }
  else {
    options = '';
  }

  if (question[question.length - 1] === '?') {
    question = question.substr(0, (question.length - 1));
    questionMark = '?';
  }
  else {
    questionMark = '';
  }

  outputFunction(sprintf('%s%s%s ', question, options, questionMark));

  function handleData(data) {
    dataString = data.toString().trim();

    if (!dataString && (validOptions && defaultOption)) {
      dataString = defaultOption;
    }

    if (dataString) {
      if (validOptions && validOptions.indexOf(dataString) === -1) {
        outputFunction(sprintf('Invalid option "%s", valid options are: %s', dataString,
          validOptions.join(', ')));
        return;
      }

      // Pause is necessary to get Node to exit without manual intervention
      stdin.pause();
      stdin.removeListener('data', handleData);
      callback(dataString);
    }
  }

  stdin.on('data', handleData);
}

/*
 * Replaces style tags with string provided by the replaceFunction.
 *
 * @param {String} string String with the formatting tags (tags can also be nested). For example:
 *                        [italic]italic text[/italic] [bold][red]bold red text[/red][/bold]
 * @param {Function} replaceFunction Function which is called with matched style tags and the
 *                                    text in-between. The function needs to return a string which
 *                                    replaces the provided text.
 *
 * @return {String} String which has been iterated over and passed to the replaceFunction.
*/
function formatTags(string, replaceFunction) {
  var stylized = string;
  var styleRegex = Object.keys(STYLES).join('|');
  var key, regex;

  if (!string) {
    return '';
  }

  if (typeof string !== 'string') {
    return string;
  }

  for (key in STYLES) {
    if (STYLES.hasOwnProperty(key)) {
      if (stylized.indexOf(sprintf('[%s]', key)) === -1) {
        continue;
      }

      regex = new RegExp(sprintf('(\\[(%s)\\])(.*?)(\\[/(%s)\\])', key, key), 'gi');
      stylized = stylized.replace(regex, replaceFunction);
    }
  }

  return stylized;
}

/*
 * Apply formatting to the input string (replaces formatting tag with the corresponding ANSI escape codes).
 *
 * @param {String} string String with the formatting tags (tags can also be nested). For example:
 *                        [italic]italic text[/italic] [bold][red]bold red text[/red][/bold]
 *
 * @return {String} String with formatting applied.
 */
function stylize(string) {
  function replaceFunction(str, p1, p2, p3) {
    var i, leni = RAINBOW_STYLES.length - 1, j = 0, lenj = p3.length,
        newStr = '';

    if (p2 === 'rainbow') {
      for (j = 0; j < lenj; j++) {
        i = (j % leni);
        newStr += sprintf('\033[%sm%s\033[%sm', RAINBOW_STYLES[i][0], p3[j],
                          RAINBOW_STYLES[i][1]);
      }

      return newStr;
    }

    return sprintf('\033[%sm%s\033[%sm', STYLES[p2][0], p3, STYLES[p2][1]);
  }

  return formatTags(string, replaceFunction);
}

/*
 * Remove style tags from the input string.
 *
 * @param {String} string String with the formatting tags (tags can also be nested). For example:
 *                        [italic]italic text[/italic] [bold][red]bold red text[/red][/bold]
 *
 * @return {String} String without the style tags.
*/
function stripStyles(string) {
  function replaceFunction(str, p1, p2, p3) {
    return sprintf('%s', p3);
  }

  return formatTags(string, replaceFunction);
}

function output(styles) {
  var term = process.env.TERM;
  var useStyles = styles;

  if (useStyles === undefined || useStyles === null) {
    if (!USE_ANSI_CODES || !term || TERMINAL_SUPPORTS_ANSI_CODES.indexOf(term.toLowerCase()) === -1) {
      useStyles = false;
    }
    else {
      useStyles = true;
    }
  }

  for (var i = 1; i < arguments.length; i++) {
    if (useStyles) {
      PUTS_FUNC(stylize(arguments[i]));
    }
    else {
      PUTS_FUNC(stripStyles(arguments[i]));
    }
  }
}

/*
 * Automatically detect based on the TERM value if the styles should be used and
 * call puts function for each of the input arguments.
 */
function puts() {
  var args = [ null ].concat(Array.prototype.slice.call(arguments));
  output.apply(null, args);
}

/*
 * Apply formatting and call puts function for each of the input arguments.
 */
function putsStyle() {
  var args = [ true ].concat(Array.prototype.slice.call(arguments));
  output.apply(null, args);
}

/*
 * Strip style tags from the input and call puts function for each of the input
 * arguments.
 */
function putsNoStyle() {
  var args = [ false ].concat(Array.prototype.slice.call(arguments));
  output.apply(null, args);
}

function disableStyles() {
  USE_ANSI_CODES = false;
}

function enableStyles() {
  USE_ANSI_CODES = true;
}

exports.VERSION = VERSION;

exports.getStylesLength = getStylesLength;
exports.lpad = lpad;
exports.rpad = rpad;
exports.printTable = printTable;
exports.printWrapped = printWrapped;
exports.prompt = prompt;
exports.formatTags = formatTags;
exports.stylize = stylize;
exports.stripStyles = stripStyles;
exports.puts = puts;
exports.putsStyle = putsStyle;
exports.putsNoStyle = putsNoStyle;

exports.disableStyles = disableStyles;
exports.enableStyles = enableStyles;
