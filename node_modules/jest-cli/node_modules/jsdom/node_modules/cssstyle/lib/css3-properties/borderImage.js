'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('border-image', v);
    },
    get: function () {
        return this.getPropertyValue('border-image');
    },
    enumerable: true,
    configurable: true
};
