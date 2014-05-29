'use strict';

var parseColor = require('../parsers').parseColor;

module.exports.definition = {
    set: function (v) {
        this.setProperty('color', parseColor(v));
    },
    get: function () {
        return this.getPropertyValue('color');
    },
    enumerable: true,
    configurable: true
};
