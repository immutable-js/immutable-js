'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-mask-composite', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-mask-composite');
    },
    enumerable: true,
    configurable: true
};
