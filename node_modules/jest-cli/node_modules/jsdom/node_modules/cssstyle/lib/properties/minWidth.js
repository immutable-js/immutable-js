'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('min-width', v);
    },
    get: function () {
        return this.getPropertyValue('min-width');
    },
    enumerable: true,
    configurable: true
};
