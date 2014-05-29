'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('max-width', v);
    },
    get: function () {
        return this.getPropertyValue('max-width');
    },
    enumerable: true,
    configurable: true
};
