/* global Symbol */

if (typeof Symbol === 'undefined') {
  Symbol = {}; // jshint ignore: line
}

if (!Symbol.iterator) {
  Symbol.iterator = '@@iterator';
}
