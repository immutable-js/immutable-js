'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-transform-style', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-transform-style');
    },
    enumerable: true,
    configurable: true
};
