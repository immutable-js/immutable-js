'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-mask-size', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-mask-size');
    },
    enumerable: true,
    configurable: true
};
