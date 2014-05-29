'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-wrap-shape-inside', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-wrap-shape-inside');
    },
    enumerable: true,
    configurable: true
};
