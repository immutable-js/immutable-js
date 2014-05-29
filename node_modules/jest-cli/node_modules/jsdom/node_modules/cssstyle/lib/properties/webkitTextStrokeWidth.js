'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-text-stroke-width', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-text-stroke-width');
    },
    enumerable: true,
    configurable: true
};
