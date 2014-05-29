'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-transform-origin', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-transform-origin');
    },
    enumerable: true,
    configurable: true
};
