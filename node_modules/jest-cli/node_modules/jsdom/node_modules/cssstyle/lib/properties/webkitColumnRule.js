'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-column-rule', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-column-rule');
    },
    enumerable: true,
    configurable: true
};
