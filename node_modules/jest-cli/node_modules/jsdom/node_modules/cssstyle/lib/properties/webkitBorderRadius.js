'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-border-radius', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-border-radius');
    },
    enumerable: true,
    configurable: true
};
