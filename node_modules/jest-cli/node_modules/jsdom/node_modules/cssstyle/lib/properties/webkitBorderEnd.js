'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-border-end', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-border-end');
    },
    enumerable: true,
    configurable: true
};
