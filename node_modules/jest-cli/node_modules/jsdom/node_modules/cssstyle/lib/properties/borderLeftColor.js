'use strict';

var isValid = module.exports.isValid = require('./borderColor').isValid;

module.exports.definition = {
    set: function (v) {
        if (isValid(v)) {
            this.setProperty('border-left-color', v);
        }
    },
    get: function () {
        return this.getPropertyValue('border-left-color');
    },
    enumerable: true,
    configurable: true
};
