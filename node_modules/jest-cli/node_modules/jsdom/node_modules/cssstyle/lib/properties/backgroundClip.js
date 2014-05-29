'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('background-clip', v);
    },
    get: function () {
        return this.getPropertyValue('background-clip');
    },
    enumerable: true,
    configurable: true
};
