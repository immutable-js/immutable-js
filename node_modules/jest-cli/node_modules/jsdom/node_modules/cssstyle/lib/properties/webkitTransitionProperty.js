'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-transition-property', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-transition-property');
    },
    enumerable: true,
    configurable: true
};
