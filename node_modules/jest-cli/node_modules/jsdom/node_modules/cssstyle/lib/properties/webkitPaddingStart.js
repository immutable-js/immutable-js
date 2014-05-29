'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-padding-start', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-padding-start');
    },
    enumerable: true,
    configurable: true
};
