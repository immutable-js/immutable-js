'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-padding-end', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-padding-end');
    },
    enumerable: true,
    configurable: true
};
