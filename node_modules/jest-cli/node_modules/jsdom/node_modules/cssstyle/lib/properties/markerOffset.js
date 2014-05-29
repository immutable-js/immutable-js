'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('marker-offset', v);
    },
    get: function () {
        return this.getPropertyValue('marker-offset');
    },
    enumerable: true,
    configurable: true
};
