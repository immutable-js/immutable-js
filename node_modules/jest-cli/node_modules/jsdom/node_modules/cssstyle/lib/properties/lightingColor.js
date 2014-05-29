'use strict';

var parseColor = require('../parsers').parseColor;

module.exports.definition = {
    set: function (v) {
        this.setProperty('lighting-color', parseColor(v));
    },
    get: function () {
        return this.getPropertyValue('lighting-color');
    },
    enumerable: true,
    configurable: true
};
