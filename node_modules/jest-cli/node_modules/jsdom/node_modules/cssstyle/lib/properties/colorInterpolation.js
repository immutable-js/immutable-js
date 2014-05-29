'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('color-interpolation', v);
    },
    get: function () {
        return this.getPropertyValue('color-interpolation');
    },
    enumerable: true,
    configurable: true
};
