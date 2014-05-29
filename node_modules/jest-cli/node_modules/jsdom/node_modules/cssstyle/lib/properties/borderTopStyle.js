'use strict';

var isValid = module.exports.isValid = require('./borderStyle').isValid;

module.exports.definition = {
    set: function (v) {
        if (isValid(v)) {
            this.setProperty('border-top-style', v);
        }
    },
    get: function () {
        return this.getPropertyValue('border-top-style');
    },
    enumerable: true,
    configurable: true
};
