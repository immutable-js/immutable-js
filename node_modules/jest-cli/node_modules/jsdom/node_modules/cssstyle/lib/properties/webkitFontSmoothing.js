'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-font-smoothing', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-font-smoothing');
    },
    enumerable: true,
    configurable: true
};
