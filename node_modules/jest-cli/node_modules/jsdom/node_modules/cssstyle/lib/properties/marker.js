'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('marker', v);
    },
    get: function () {
        return this.getPropertyValue('marker');
    },
    enumerable: true,
    configurable: true
};
