'use strict';

var isValid = module.exports.isValid = require('./borderStyle').isValid;

module.exports.definition = {
    set: function (v) {
        if (isValid(v)) {
            this.setProperty('border-bottom-style', v);
        }
    },
    get: function () {
        return this.getPropertyValue('border-bottom-style');
    },
    enumerable: true,
    configurable: true
};
