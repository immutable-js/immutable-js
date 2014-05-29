'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-wrap', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-wrap');
    },
    enumerable: true,
    configurable: true
};
