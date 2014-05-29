'use strict';

var parseMeasurement = require('../parsers').parseMeasurement;

module.exports.definition = {
    set: function (v) {
        this.setProperty('width', parseMeasurement(v));
    },
    get: function () {
        return this.getPropertyValue('width');
    },
    enumerable: true,
    configurable: true
};
