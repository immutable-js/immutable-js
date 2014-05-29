'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-background-size', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-background-size');
    },
    enumerable: true,
    configurable: true
};
