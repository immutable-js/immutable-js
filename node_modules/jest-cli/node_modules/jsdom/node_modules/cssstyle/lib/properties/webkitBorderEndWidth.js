'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-border-end-width', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-border-end-width');
    },
    enumerable: true,
    configurable: true
};
