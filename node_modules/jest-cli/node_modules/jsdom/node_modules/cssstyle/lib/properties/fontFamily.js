'use strict';

var TYPES = require('../parsers').TYPES;
var valueType = require('../parsers').valueType;

var partsRegEx = /\s*,\s*/;
module.exports.isValid = function isValid(v) {
    var parts = v.split(partsRegEx);
    var len = parts.len;
    var i;
    var type;
    for (i = 0; i < len; i++) {
        type = valueType(parts[i]);
        if (type === TYPES.STRING || type === TYPES.KEYWORD) {
            return true;
        }
    }
    return false;
};

module.exports.definition = {
    set: function (v) {
        this.setProperty('font-family', v);
    },
    get: function () {
        return this.getPropertyValue('font-family');
    },
    enumerable: true,
    configurable: true
};
