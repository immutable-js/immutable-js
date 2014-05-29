'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-print-color-adjust', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-print-color-adjust');
    },
    enumerable: true,
    configurable: true
};
