'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('marker-end', v);
    },
    get: function () {
        return this.getPropertyValue('marker-end');
    },
    enumerable: true,
    configurable: true
};
