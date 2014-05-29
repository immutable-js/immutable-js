'use strict';

var parseColor = require('../parsers').parseColor;

module.exports.definition = {
    set: function (v) {
        this.setProperty('text-overline-color', parseColor(v));
    },
    get: function () {
        return this.getPropertyValue('text-overline-color');
    },
    enumerable: true,
    configurable: true
};
