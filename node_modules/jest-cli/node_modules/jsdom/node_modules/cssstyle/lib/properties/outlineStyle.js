'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('outline-style', v);
    },
    get: function () {
        return this.getPropertyValue('outline-style');
    },
    enumerable: true,
    configurable: true
};
