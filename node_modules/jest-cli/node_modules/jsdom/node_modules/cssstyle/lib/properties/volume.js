'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('volume', v);
    },
    get: function () {
        return this.getPropertyValue('volume');
    },
    enumerable: true,
    configurable: true
};
