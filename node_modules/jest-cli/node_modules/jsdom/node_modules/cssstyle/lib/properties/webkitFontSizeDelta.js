'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-font-size-delta', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-font-size-delta');
    },
    enumerable: true,
    configurable: true
};
