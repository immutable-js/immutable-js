'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('outline-offset', v);
    },
    get: function () {
        return this.getPropertyValue('outline-offset');
    },
    enumerable: true,
    configurable: true
};
