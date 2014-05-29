'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('filter', v);
    },
    get: function () {
        return this.getPropertyValue('filter');
    },
    enumerable: true,
    configurable: true
};
