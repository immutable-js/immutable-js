'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('display', v);
    },
    get: function () {
        return this.getPropertyValue('display');
    },
    enumerable: true,
    configurable: true
};
