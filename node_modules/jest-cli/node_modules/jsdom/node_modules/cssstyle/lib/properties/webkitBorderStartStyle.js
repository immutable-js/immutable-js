'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-border-start-style', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-border-start-style');
    },
    enumerable: true,
    configurable: true
};
