'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('text-shadow', v);
    },
    get: function () {
        return this.getPropertyValue('text-shadow');
    },
    enumerable: true,
    configurable: true
};
