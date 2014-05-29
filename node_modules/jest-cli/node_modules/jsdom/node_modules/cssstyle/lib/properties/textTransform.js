'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('text-transform', v);
    },
    get: function () {
        return this.getPropertyValue('text-transform');
    },
    enumerable: true,
    configurable: true
};
