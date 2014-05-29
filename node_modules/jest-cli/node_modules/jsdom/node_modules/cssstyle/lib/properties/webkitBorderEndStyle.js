'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-border-end-style', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-border-end-style');
    },
    enumerable: true,
    configurable: true
};
