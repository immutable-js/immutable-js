'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-wrap-flow', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-wrap-flow');
    },
    enumerable: true,
    configurable: true
};
