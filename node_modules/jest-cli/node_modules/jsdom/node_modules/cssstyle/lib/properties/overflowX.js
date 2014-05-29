'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('overflow-x', v);
    },
    get: function () {
        return this.getPropertyValue('overflow-x');
    },
    enumerable: true,
    configurable: true
};
