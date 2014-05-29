'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('box-sizing', v);
    },
    get: function () {
        return this.getPropertyValue('box-sizing');
    },
    enumerable: true,
    configurable: true
};
