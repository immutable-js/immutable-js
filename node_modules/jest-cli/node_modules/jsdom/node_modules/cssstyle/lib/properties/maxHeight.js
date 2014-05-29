'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('max-height', v);
    },
    get: function () {
        return this.getPropertyValue('max-height');
    },
    enumerable: true,
    configurable: true
};
