'use strict';

var shorthandParser = require('../parsers').shorthandParser;
var shorthandSetter = require('../parsers').shorthandSetter;
var shorthandGetter = require('../parsers').shorthandGetter;

var shorthand_for = {
    'border-width': require('./borderWidth'),
    'border-style': require('./borderStyle'),
    'border-color': require('./borderColor')
};

module.exports.isValid = function isValid(v) {
    return shorthandParser(v, shorthand_for) !== undefined;
};

module.exports.definition = {
    set: shorthandSetter('border', shorthand_for),
    get: shorthandGetter('border', shorthand_for),
    enumerable: true,
    configurable: true
};
