'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('size', v);
    },
    get: function () {
        return this.getPropertyValue('size');
    },
    enumerable: true,
    configurable: true
};
