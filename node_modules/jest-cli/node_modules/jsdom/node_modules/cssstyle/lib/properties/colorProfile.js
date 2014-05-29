'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('color-profile', v);
    },
    get: function () {
        return this.getPropertyValue('color-profile');
    },
    enumerable: true,
    configurable: true
};
