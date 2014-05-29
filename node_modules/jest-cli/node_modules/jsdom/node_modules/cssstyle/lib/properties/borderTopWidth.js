'use strict';

var isValid = module.exports.isValid = require('./borderWidth').isValid;

module.exports.definition = {
    set: function (v) {
        if (isValid(v)) {
            this.setProperty('border-top-width', v);
        }
    },
    get: function () {
        return this.getPropertyValue('border-top-width');
    },
    enumerable: true,
    configurable: true
};
