'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('zoom', v);
    },
    get: function () {
        return this.getPropertyValue('zoom');
    },
    enumerable: true,
    configurable: true
};
