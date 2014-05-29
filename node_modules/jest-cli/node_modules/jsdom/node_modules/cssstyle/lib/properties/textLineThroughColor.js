'use strict';

var parseColor = require('../parsers').parseColor;

module.exports.definition = {
    set: function (v) {
        this.setProperty('text-line-through-color', parseColor(v));
    },
    get: function () {
        return this.getPropertyValue('text-line-through-color');
    },
    enumerable: true,
    configurable: true
};
