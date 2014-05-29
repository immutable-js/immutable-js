'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-animation-name', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-animation-name');
    },
    enumerable: true,
    configurable: true
};
