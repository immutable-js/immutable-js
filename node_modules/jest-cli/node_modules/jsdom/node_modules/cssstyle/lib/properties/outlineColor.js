'use strict';

var parseColor = require('../parsers').parseColor;

module.exports.definition = {
    set: function (v) {
        this.setProperty('outline-color', parseColor(v));
    },
    get: function () {
        return this.getPropertyValue('outline-color');
    },
    enumerable: true,
    configurable: true
};
