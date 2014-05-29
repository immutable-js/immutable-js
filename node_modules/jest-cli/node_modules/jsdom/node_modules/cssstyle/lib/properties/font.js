'use strict';

var TYPES = require('../parsers').TYPES;
var valueType = require('../parsers').valueType;
var shorthandParser = require('../parsers').shorthandParser;
var shorthandSetter = require('../parsers').shorthandSetter;
var shorthandGetter = require('../parsers').shorthandGetter;

var shorthand_for = {
    'font-family': require('./fontFamily'),
    'font-size': require('./fontSize'),
    'font-style': require('./fontStyle'),
    'font-variant': require('./fontVariant'),
    'font-weight': require('./fontWeight'),
    'line-height': require('./lineHeight')
};

var static_fonts = ['caption', 'icon', 'menu', 'message-box', 'small-caption', 'status-bar', 'inherit'];

module.exports.isValid = function isValid(v) {
    return (shorthandParser(v, shorthand_for) !== undefined) ||
        (valueType(v) === TYPES.KEYWORD && static_fonts.indexOf(v.toLowerCase()) !== -1);
};

var setter = shorthandSetter('background', shorthand_for);

module.exports.definition = {
    set: function (v) {
        var short = shorthandParser(v, shorthand_for);
        if (short !== undefined) {
            return setter.call(this, v);
        }
        if (valueType(v) === TYPES.KEYWORD && static_fonts.indexOf(v.toLowerCase()) !== -1) {
            this.setProperty('font', v);
        }
    },
    get: shorthandGetter('background', shorthand_for),
    enumerable: true,
    configurable: true
};
